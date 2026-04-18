import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Search problems
router.get('/search/:query', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = (req.params.query as string).toLowerCase();
    const problems = await prisma.problem.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { pattern: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true, title: true, slug: true, difficulty: true,
        pattern: true, order: true,
        topic: { select: { name: true, slug: true, color: true, icon: true } }
      },
      orderBy: { title: 'asc' },
      take: 30
    });

    res.json(problems);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all topics with problem counts
router.get('/topics', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { problems: true } },
        problems: {
          select: { id: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    // Get user progress for all problems
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId },
      select: { problemId: true, status: true }
    });
    const progressMap = new Map(progress.map(p => [p.problemId, p.status]));

    const topicsWithProgress = topics.map(topic => {
      const completedCount = topic.problems.filter(
        p => progressMap.get(p.id) === 'COMPLETED'
      ).length;

      return {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: topic.order,
        totalProblems: topic._count.problems,
        completedProblems: completedCount,
        isUnlocked: topic.problems.some(p => {
          const status = progressMap.get(p.id);
          return status && status !== 'LOCKED';
        }) || topic.order === 1
      };
    });

    res.json(topicsWithProgress);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get problems for a topic
router.get('/topics/:slug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        problems: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, slug: true, difficulty: true,
            order: true, pattern: true
          }
        }
      }
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId, problem: { topicId: topic.id } },
      select: { problemId: true, status: true, score: true, bestScore: true, stage: true }
    });
    const progressMap = new Map(progress.map(p => [p.problemId, p]));

    const problemsWithProgress = topic.problems.map((problem: any) => ({
      ...problem,
      status: progressMap.get(problem.id)?.status ?? 'LOCKED',
      score: progressMap.get(problem.id)?.score ?? 0,
      bestScore: progressMap.get(problem.id)?.bestScore ?? 0,
      stage: progressMap.get(problem.id)?.stage ?? 0
    }));

    res.json({ ...topic, problems: problemsWithProgress });
  } catch (error) {
    console.error('Get topic problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single problem with full content
router.get('/:slug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: { topic: { select: { name: true, slug: true, color: true } } }
    });

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    // Check if user has access
    const progress = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: req.userId!, problemId: problem.id } }
    });

    if (progress?.status === 'LOCKED') {
      res.status(403).json({ error: 'Problem is locked. Complete previous problems first.' });
      return;
    }

    // Parse JSON string fields into actual objects
    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    res.json({
      ...problem,
      visualSteps: parseJson(problem.visualSteps),
      solutions: parseJson(problem.solutions),
      complexity: parseJson(problem.complexity),
      quiz: parseJson(problem.quiz),
      hints: parseJson(problem.hints),
      commonMistakes: parseJson(problem.commonMistakes),
      userProgress: progress ? {
        status: progress.status,
        score: progress.score,
        bestScore: progress.bestScore,
        stage: progress.stage,
        attempts: progress.attempts
      } : null
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
