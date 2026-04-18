import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '90d' });
  return { accessToken, refreshToken };
}

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'Email, username, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      res.status(409).json({ error: 'Email or username already taken' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash }
    });

    // Initialize progress: unlock first topic's first problem
    const firstTopic = await prisma.topic.findFirst({ orderBy: { order: 'asc' } });
    if (firstTopic) {
      const firstProblem = await prisma.problem.findFirst({
        where: { topicId: firstTopic.id },
        orderBy: { order: 'asc' }
      });
      if (firstProblem) {
        await prisma.userProgress.create({
          data: { userId: user.id, problemId: firstProblem.id, status: 'AVAILABLE' }
        });
      }
    }

    const tokens = generateTokens(user.id);
    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username, level: user.level, xp: user.xp },
      ...tokens
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sign-In
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) { res.status(400).json({ error: 'ID token required' }); return; }

    // Verify Google ID token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) { res.status(401).json({ error: 'Invalid Google token' }); return; }
    const googleUser = await googleRes.json() as { sub: string; email: string; name: string; picture: string };

    if (!googleUser.email) { res.status(400).json({ error: 'No email in Google token' }); return; }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      // Existing user — update Google info if needed
      if (!user.googleId) {
        await prisma.user.update({ where: { id: user.id }, data: { googleId: googleUser.sub, authProvider: 'google', avatarUrl: googleUser.picture } });
      }
    } else {
      // New user — create account
      const username = googleUser.name?.replace(/\s+/g, '').toLowerCase().slice(0, 20) || `user${Date.now()}`;
      const uniqueUsername = await prisma.user.findUnique({ where: { username } }) ? `${username}${Math.floor(Math.random() * 999)}` : username;

      user = await prisma.user.create({
        data: {
          email: googleUser.email, username: uniqueUsername,
          authProvider: 'google', googleId: googleUser.sub,
          avatarUrl: googleUser.picture, trialStartDate: new Date()
        }
      });

      // Unlock first problem
      const firstTopic = await prisma.topic.findFirst({ orderBy: { order: 'asc' } });
      if (firstTopic) {
        const firstProblem = await prisma.problem.findFirst({ where: { topicId: firstTopic.id }, orderBy: { order: 'asc' } });
        if (firstProblem) {
          await prisma.userProgress.create({ data: { userId: user.id, problemId: firstProblem.id, status: 'AVAILABLE' } });
        }
      }
    }

    const tokens = generateTokens(user.id);
    res.json({
      user: { id: user.id, email: user.email, username: user.username, level: user.level, xp: user.xp, hearts: user.hearts, streak: user.streak, league: user.league, avatarUrl: user.avatarUrl },
      ...tokens
    });
  } catch (error) { console.error('Google auth error:', error); res.status(500).json({ error: 'Internal server error' }); }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.passwordHash) { res.status(401).json({ error: 'This account uses Google Sign-In. Please login with Google.' }); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const tokens = generateTokens(user.id);
    res.json({
      user: {
        id: user.id, email: user.email, username: user.username,
        level: user.level, xp: user.xp, hearts: user.hearts,
        streak: user.streak, league: user.league
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const tokens = generateTokens(payload.userId);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, username: true, xp: true, level: true,
        hearts: true, heartsUpdatedAt: true, streak: true, bestStreak: true,
        lastActiveDate: true, streakFreezes: true, league: true,
        weeklyXp: true, dailyGoal: true, preferredLang: true, createdAt: true,
        authProvider: true, googleId: true, avatarUrl: true,
        experienceLevel: true, buildGoals: true,
        trialStartDate: true, subscriptionStatus: true, subscriptionExpiresAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate current hearts (refill 1 every 30 min, max 5)
    const now = new Date();
    const msSinceUpdate = now.getTime() - user.heartsUpdatedAt.getTime();
    const heartsToAdd = Math.floor(msSinceUpdate / (30 * 60 * 1000));
    const currentHearts = Math.min(5, user.hearts + heartsToAdd);

    // Trial/subscription info
    const trialStart = user.trialStartDate ? new Date(user.trialStartDate) : null;
    const trialDaysTotal = 7;
    const trialDaysUsed = trialStart ? Math.floor((now.getTime() - trialStart.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    const trialDaysRemaining = Math.max(0, trialDaysTotal - trialDaysUsed);
    const isTrialActive = user.subscriptionStatus === 'trial' && trialDaysRemaining > 0;
    const isPro = user.subscriptionStatus === 'active' || isTrialActive;

    res.json({ ...user, hearts: currentHearts, isTrialActive, trialDaysRemaining, isPro });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
