import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get today's daily challenge
router.get('/today', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daily = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: {
        problem: {
          include: { topic: { select: { name: true, slug: true, color: true } } }
        }
      }
    });

    // If no daily challenge exists for today, create one
    if (!daily) {
      const problemCount = await prisma.problem.count();
      const randomProblem = await prisma.problem.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * problemCount)
      });

      if (!randomProblem) {
        res.status(404).json({ error: 'No problems available' });
        return;
      }

      daily = await prisma.dailyChallenge.create({
        data: { date: today, problemId: randomProblem.id },
        include: {
          problem: {
            include: { topic: { select: { name: true, slug: true, color: true } } }
          }
        }
      });
    }

    // Check if user has completed today's challenge
    const progress = await prisma.userProgress.findUnique({
      where: { userId_problemId: { userId: req.userId!, problemId: daily.problemId } }
    });

    res.json({
      date: daily.date,
      problem: {
        id: daily.problem.id,
        title: daily.problem.title,
        slug: daily.problem.slug,
        difficulty: daily.problem.difficulty,
        pattern: daily.problem.pattern,
        story: daily.problem.story,
        topic: daily.problem.topic
      },
      completed: progress?.status === 'COMPLETED',
      bonusXp: 20
    });
  } catch (error) {
    console.error('Daily challenge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
