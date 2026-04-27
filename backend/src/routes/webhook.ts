import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// RevenueCat event types that mean the user has active access
const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

// RevenueCat event types that mean the user has lost access
const INACTIVE_EVENTS = new Set([
  'EXPIRATION',
  'CANCELLATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
]);

router.post('/revenuecat', async (req: Request, res: Response): Promise<void> => {
  // Verify webhook secret
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  try {
    const event = req.body?.event;
    if (!event) {
      res.status(400).json({ error: 'Missing event payload' });
      return;
    }

    const { type, app_user_id, expiration_at_ms } = event;
    if (!type || !app_user_id) {
      res.status(400).json({ error: 'Missing type or app_user_id' });
      return;
    }

    // app_user_id is the user's UUID in our DB (we call Purchases.logIn(userId))
    const user = await prisma.user.findUnique({ where: { id: app_user_id } });
    if (!user) {
      // Could be an anonymous user or wrong ID — ack anyway so RevenueCat stops retrying
      res.status(200).json({ received: true });
      return;
    }

    if (ACTIVE_EVENTS.has(type)) {
      const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null;
      await prisma.user.update({
        where: { id: app_user_id },
        data: {
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });
    } else if (INACTIVE_EVENTS.has(type)) {
      await prisma.user.update({
        where: { id: app_user_id },
        data: {
          subscriptionStatus: 'expired',
          subscriptionExpiresAt: expiration_at_ms ? new Date(expiration_at_ms) : null,
        },
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('RevenueCat webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
