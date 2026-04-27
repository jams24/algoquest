import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Checks DB subscription status and returns whether user has active access
export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, subscriptionExpiresAt: true, trialStartDate: true }
  });
  if (!user) return false;

  const now = new Date();

  if (user.subscriptionStatus === 'active') {
    // No expiry set means manually granted (e.g. admin grant) — allow
    if (!user.subscriptionExpiresAt) return true;
    return user.subscriptionExpiresAt > now;
  }

  if (user.subscriptionStatus === 'trial') {
    const trialStart = user.trialStartDate ? new Date(user.trialStartDate) : null;
    if (!trialStart) return false;
    const daysUsed = Math.floor((now.getTime() - trialStart.getTime()) / (24 * 60 * 60 * 1000));
    return daysUsed < 3;
  }

  return false;
}

// Middleware: blocks request with 403 if user has no active subscription or trial
export async function requireSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const hasSub = await userHasActiveSubscription(req.userId!);
    if (!hasSub) {
      res.status(403).json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' });
      return;
    }
    next();
  } catch (error) {
    console.error('requireSubscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
