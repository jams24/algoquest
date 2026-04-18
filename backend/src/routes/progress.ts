import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkAndAwardAchievements } from '../services/achievements';
import { calculateLevel } from '../services/leveling';

const router = Router();
const prisma = new PrismaClient();

// Submit quiz answer / complete a stage
router.post('/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { problemId, stage, score, perfect } = req.body;
    const userId = req.userId!;

    // Get or create progress
    let progress = await prisma.userProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: { userId, problemId, status: 'IN_PROGRESS', stage, score },
      update: { stage, score, attempts: { increment: 1 }, lastAttempt: new Date() }
    });

    // Calculate XP earned
    let xpEarned = 10; // base XP per stage
    if (perfect) xpEarned += 25; // perfect bonus

    // Update user XP + streak
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    lastActive?.setHours(0, 0, 0, 0);

    let newStreak = user.streak;
    if (!lastActive || lastActive.getTime() < today.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        newStreak = user.streak + 1; // continue streak
      } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
        if (user.streakFreezes > 0 && lastActive) {
          newStreak = user.streak; // use streak freeze
          await prisma.user.update({
            where: { id: userId },
            data: { streakFreezes: { decrement: 1 } }
          });
        } else {
          newStreak = 1; // streak broken, start new
        }
      }
    }

    // Streak bonus XP
    const streakBonus = Math.min(newStreak * 5, 50);
    xpEarned += streakBonus;

    const newXp = user.xp + xpEarned;
    const newLevel = calculateLevel(newXp);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        weeklyXp: { increment: xpEarned },
        streak: newStreak,
        bestStreak: Math.max(user.bestStreak, newStreak),
        lastActiveDate: new Date()
      }
    });

    // If stage 4 (master) completed, mark problem as completed and unlock next
    let unlockedProblem = null;
    if (stage >= 4) {
      await prisma.userProgress.update({
        where: { userId_problemId: { userId, problemId } },
        data: {
          status: 'COMPLETED',
          bestScore: Math.max(progress.bestScore, score),
          completedAt: new Date()
        }
      });

      // Unlock next problem
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { topic: true }
      });

      if (problem) {
        // Try next problem in same topic
        const nextProblem = await prisma.problem.findFirst({
          where: { topicId: problem.topicId, order: problem.order + 1 }
        });

        if (nextProblem) {
          await prisma.userProgress.upsert({
            where: { userId_problemId: { userId, problemId: nextProblem.id } },
            create: { userId, problemId: nextProblem.id, status: 'AVAILABLE' },
            update: { status: 'AVAILABLE' }
          });
          unlockedProblem = { id: nextProblem.id, title: nextProblem.title, slug: nextProblem.slug };
        } else {
          // Topic complete — unlock first problem of next topic
          const nextTopic = await prisma.topic.findFirst({
            where: { order: problem.topic.order + 1 }
          });
          if (nextTopic) {
            const firstProblem = await prisma.problem.findFirst({
              where: { topicId: nextTopic.id },
              orderBy: { order: 'asc' }
            });
            if (firstProblem) {
              await prisma.userProgress.upsert({
                where: { userId_problemId: { userId, problemId: firstProblem.id } },
                create: { userId, problemId: firstProblem.id, status: 'AVAILABLE' },
                update: { status: 'AVAILABLE' }
              });
              unlockedProblem = { id: firstProblem.id, title: firstProblem.title, slug: firstProblem.slug };
            }
          }
        }

        // Schedule spaced review
        await prisma.spacedReview.upsert({
          where: { userId_problemId: { userId, problemId } },
          create: { userId, problemId, nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          update: { nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), repetitions: { increment: 1 } }
        });
      }
    }

    // Check achievements
    const newAchievements = await checkAndAwardAchievements(userId);

    const leveledUp = newLevel > user.level;

    res.json({
      xpEarned,
      streakBonus,
      totalXp: newXp,
      level: newLevel,
      leveledUp,
      levelTitle: getLevelTitle(newLevel),
      streak: newStreak,
      hearts: updatedUser.hearts,
      unlockedProblem,
      newAchievements
    });
  } catch (error) {
    console.error('Submit progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use a heart (wrong answer)
router.post('/use-heart', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Calculate current hearts with time-based refill
    const now = new Date();
    const msSinceUpdate = now.getTime() - user.heartsUpdatedAt.getTime();
    const heartsRefilled = Math.floor(msSinceUpdate / (30 * 60 * 1000));
    const currentHearts = Math.min(5, user.hearts + heartsRefilled);

    if (currentHearts <= 0) {
      res.status(400).json({ error: 'No hearts remaining. Wait for refill or review a problem.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { hearts: currentHearts - 1, heartsUpdatedAt: now }
    });

    res.json({ hearts: currentHearts - 1 });
  } catch (error) {
    console.error('Use heart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overall progress stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const [user, completed, totalProblems, topicProgress] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.userProgress.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.problem.count(),
      prisma.topic.findMany({
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { problems: true } },
          problems: {
            select: { id: true, difficulty: true },
          }
        }
      })
    ]);

    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const completedIds = (await prisma.userProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { problemId: true }
    })).map(p => p.problemId);

    const completedSet = new Set(completedIds);

    const topics = topicProgress.map(t => ({
      name: t.name,
      slug: t.slug,
      total: t._count.problems,
      completed: t.problems.filter(p => completedSet.has(p.id)).length
    }));

    // Difficulty breakdown
    const allProblems = topicProgress.flatMap(t => t.problems);
    const difficultyStats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 }
    };
    for (const p of allProblems) {
      const key = p.difficulty.toLowerCase() as keyof typeof difficultyStats;
      difficultyStats[key].total++;
      if (completedSet.has(p.id)) difficultyStats[key].completed++;
    }

    res.json({
      totalProblems,
      completedProblems: completed,
      percentage: Math.round((completed / totalProblems) * 100),
      level: user.level,
      levelTitle: getLevelTitle(user.level),
      xp: user.xp,
      streak: user.streak,
      bestStreak: user.bestStreak,
      topics,
      difficultyStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get problems due for spaced review
router.get('/reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.spacedReview.findMany({
      where: { userId: req.userId!, nextReview: { lte: new Date() } },
      include: {
        problem: {
          include: { topic: { select: { name: true, color: true } } }
        }
      },
      orderBy: { nextReview: 'asc' }
    });

    res.json(reviews.map(r => ({
      id: r.problem.id,
      title: r.problem.title,
      slug: r.problem.slug,
      difficulty: r.problem.difficulty,
      pattern: r.problem.pattern,
      topic: r.problem.topic,
      reviewId: r.id,
      interval: r.interval,
      repetitions: r.repetitions
    })));
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getLevelTitle(level: number): string {
  if (level <= 5) return 'Bug Squasher';
  if (level <= 15) return 'Code Cadet';
  if (level <= 25) return 'Algorithm Apprentice';
  if (level <= 35) return 'Data Wizard';
  if (level <= 45) return 'Interview Ready';
  return 'NeetCode Master';
}

export default router;
