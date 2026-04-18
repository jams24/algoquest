import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get weekly leaderboard (by league)
router.get('/weekly', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const leaderboard = await prisma.user.findMany({
      where: { league: user.league },
      orderBy: { weeklyXp: 'desc' },
      take: 30,
      select: {
        id: true, username: true, weeklyXp: true, level: true, league: true
      }
    });

    const rank = leaderboard.findIndex(u => u.id === user.id) + 1;

    res.json({
      league: user.league,
      myRank: rank || null,
      myWeeklyXp: user.weeklyXp,
      leaderboard: leaderboard.map((u, i) => ({
        rank: i + 1,
        username: u.username,
        weeklyXp: u.weeklyXp,
        level: u.level,
        isMe: u.id === user.id
      }))
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all-time leaderboard
router.get('/alltime', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaderboard = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 100,
      select: {
        id: true, username: true, xp: true, level: true, league: true
      }
    });

    res.json(leaderboard.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      xp: u.xp,
      level: u.level,
      league: u.league
    })));
  } catch (error) {
    console.error('All-time leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
