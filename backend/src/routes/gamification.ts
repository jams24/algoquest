import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get user achievements
router.get('/achievements', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({
        where: { userId: req.userId },
        select: { achievementId: true, unlockedAt: true }
      })
    ]);

    const unlockedMap = new Map(userAchievements.map(a => [a.achievementId, a.unlockedAt]));

    res.json(allAchievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null
    })));
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.patch('/settings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferredLang, dailyGoal } = req.body;
    const data: Record<string, unknown> = {};

    if (preferredLang && ['python', 'java', 'cpp'].includes(preferredLang)) {
      data.preferredLang = preferredLang;
    }
    if (dailyGoal && [1, 3, 5].includes(dailyGoal)) {
      data.dailyGoal = dailyGoal;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { preferredLang: true, dailyGoal: true }
    });

    res.json(user);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
