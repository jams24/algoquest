import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';
import { calculateLevel } from '../services/leveling';

const router = Router();
const prisma = new PrismaClient();

// ─── TRACKS ──────────────────────────────────────────────────────────────────

// List all tracks with lesson counts + user progress
router.get('/tracks', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tracks = await prisma.designTrack.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: { select: { id: true }, orderBy: { order: 'asc' } }
      }
    });

    const userProgress = await prisma.userDesignLessonProgress.findMany({
      where: { userId: req.userId! },
      select: { lessonId: true, status: true }
    });
    const progressMap = new Map(userProgress.map(p => [p.lessonId, p.status]));

    const result = tracks.map(track => {
      const total = track.lessons.length;
      const completed = track.lessons.filter(l => progressMap.get(l.id) === 'COMPLETED').length;
      const isUnlocked = track.order === 1 || tracks
        .filter(t => t.order < track.order)
        .every(t => t.lessons.every(l => progressMap.get(l.id) === 'COMPLETED'));

      return {
        id: track.id, name: track.name, slug: track.slug,
        description: track.description, icon: track.icon,
        color: track.color, order: track.order, level: track.level,
        totalLessons: total, completedLessons: completed, isUnlocked
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get design tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a track with its lessons list
router.get('/tracks/:slug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const track = await prisma.designTrack.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, slug: true, order: true }
        }
      }
    });
    if (!track) { res.status(404).json({ error: 'Track not found' }); return; }

    const userProgress = await prisma.userDesignLessonProgress.findMany({
      where: { userId: req.userId!, lessonId: { in: track.lessons.map(l => l.id) } },
      select: { lessonId: true, status: true, stage: true }
    });
    const progressMap = new Map(userProgress.map(p => [p.lessonId, p]));

    const lessons = track.lessons.map((lesson, i) => ({
      ...lesson,
      status: progressMap.get(lesson.id)?.status ?? (i === 0 ? 'AVAILABLE' : 'LOCKED'),
      stage: progressMap.get(lesson.id)?.stage ?? 0
    }));

    res.json({ ...track, lessons });
  } catch (error) {
    console.error('Get design track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── LESSONS ─────────────────────────────────────────────────────────────────

// Get full lesson content (requires subscription)
router.get('/lessons/:slug', authenticate, requireSubscription, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lesson = await prisma.designLesson.findUnique({
      where: { slug: req.params.slug as string },
      include: { track: { select: { name: true, slug: true, color: true, icon: true } } }
    });
    if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

    const progress = await prisma.userDesignLessonProgress.findUnique({
      where: { userId_lessonId: { userId: req.userId!, lessonId: lesson.id } }
    });

    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    res.json({
      ...lesson,
      diagramSteps: parseJson(lesson.diagramSteps),
      tradeoffs: parseJson(lesson.tradeoffs),
      whenToUse: parseJson(lesson.whenToUse),
      whenNotToUse: parseJson(lesson.whenNotToUse),
      keyPoints: parseJson(lesson.keyPoints),
      quiz: parseJson(lesson.quiz),
      userProgress: progress ? { status: progress.status, stage: progress.stage, score: progress.score } : null
    });
  } catch (error) {
    console.error('Get design lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit lesson progress
router.post('/lessons/:slug/progress', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stage, score, completed } = req.body;
    const userId = req.userId!;

    const lesson = await prisma.designLesson.findUnique({ where: { slug: req.params.slug as string } });
    if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

    const existing = await prisma.userDesignLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } }
    });

    await prisma.userDesignLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      create: { userId, lessonId: lesson.id, status: completed ? 'COMPLETED' : 'IN_PROGRESS', stage, score },
      update: {
        stage: Math.max(existing?.stage ?? 0, stage),
        score: Math.max(existing?.score ?? 0, score),
        status: completed ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: completed ? new Date() : undefined
      }
    });

    // Award XP on completion
    let xpEarned = 0;
    if (completed && existing?.status !== 'COMPLETED') {
      xpEarned = 30 + Math.round((score / 100) * 20); // 30 base + up to 20 bonus
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + xpEarned;
        await prisma.user.update({
          where: { id: userId },
          data: { xp: newXp, level: calculateLevel(newXp), weeklyXp: { increment: xpEarned } }
        });

        // Unlock next lesson in track
        const nextLesson = await prisma.designLesson.findFirst({
          where: { trackId: lesson.trackId, order: lesson.order + 1 }
        });
        if (nextLesson) {
          await prisma.userDesignLessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId: nextLesson.id } },
            create: { userId, lessonId: nextLesson.id, status: 'AVAILABLE' },
            update: { status: 'AVAILABLE' }
          });
        }
      }
    }

    res.json({ success: true, xpEarned });
  } catch (error) {
    console.error('Submit lesson progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── INTERVIEW QUESTIONS ─────────────────────────────────────────────────────

// List all interview questions (grouped by category)
router.get('/questions', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await prisma.designQuestion.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      select: { id: true, title: true, slug: true, category: true, difficulty: true, order: true }
    });

    const userProgress = await prisma.userDesignQuestionProgress.findMany({
      where: { userId: req.userId! },
      select: { questionId: true, status: true }
    });
    const progressMap = new Map(userProgress.map(p => [p.questionId, p.status]));

    const withProgress = questions.map(q => ({
      ...q,
      status: progressMap.get(q.id) ?? 'AVAILABLE'
    }));

    // Group by category
    const grouped = withProgress.reduce((acc: Record<string, any[]>, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Get design questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get full interview question (requires subscription)
router.get('/questions/:slug', authenticate, requireSubscription, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await prisma.designQuestion.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!question) { res.status(404).json({ error: 'Question not found' }); return; }

    const progress = await prisma.userDesignQuestionProgress.findUnique({
      where: { userId_questionId: { userId: req.userId!, questionId: question.id } }
    });

    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    res.json({
      ...question,
      functionalReqs: parseJson(question.functionalReqs),
      nonFunctionalReqs: parseJson(question.nonFunctionalReqs),
      clarifyingQuestions: parseJson(question.clarifyingQuestions),
      estimations: parseJson(question.estimations),
      components: parseJson(question.components),
      bottlenecks: parseJson(question.bottlenecks),
      tradeoffs: parseJson(question.tradeoffs),
      realWorldExamples: parseJson(question.realWorldExamples),
      tips: parseJson(question.tips),
      quiz: parseJson(question.quiz),
      userProgress: progress ? { status: progress.status, stage: progress.stage, score: progress.score } : null
    });
  } catch (error) {
    console.error('Get design question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit interview question progress
router.post('/questions/:slug/progress', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stage, score, completed } = req.body;
    const userId = req.userId!;

    const question = await prisma.designQuestion.findUnique({ where: { slug: req.params.slug as string } });
    if (!question) { res.status(404).json({ error: 'Question not found' }); return; }

    const existing = await prisma.userDesignQuestionProgress.findUnique({
      where: { userId_questionId: { userId, questionId: question.id } }
    });

    await prisma.userDesignQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId: question.id } },
      create: { userId, questionId: question.id, status: completed ? 'COMPLETED' : 'IN_PROGRESS', stage, score },
      update: {
        stage: Math.max(existing?.stage ?? 0, stage),
        score: Math.max(existing?.score ?? 0, score),
        status: completed ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: completed ? new Date() : undefined
      }
    });

    let xpEarned = 0;
    if (completed && existing?.status !== 'COMPLETED') {
      xpEarned = 50 + Math.round((score / 100) * 30);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + xpEarned;
        await prisma.user.update({
          where: { id: userId },
          data: { xp: newXp, level: calculateLevel(newXp), weeklyXp: { increment: xpEarned } }
        });
      }
    }

    res.json({ success: true, xpEarned });
  } catch (error) {
    console.error('Submit question progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
