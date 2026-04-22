import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import admin from '../firebase';
import { requireAuth, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/user', requireAuth, async (req: AuthRequest, res: Response) => {
  const { targetUserId, title, body } = req.body;
  try {
    const tokens = await prisma.fcmToken.findMany({ where: { userId: targetUserId } });
    if (tokens.length === 0) {
      res.status(404).json({ error: 'No FCM tokens found for user' });
      return;
    }
    const fcmTokens = tokens.map(t => t.token);

    if (admin.apps.length === 0) {
      res.status(500).json({ error: 'Firebase Admin not initialized properly' });
      return;
    }

    const result = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title, body }
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'Error sending notification', details: err.message });
  }
});

router.post('/team', requireAuth, async (req: AuthRequest, res: Response) => {
  const { teamId, title, body } = req.body;
  try {
    const users = await prisma.user.findMany({ where: { teamId }, select: { id: true } });
    if (users.length === 0) {
      res.status(404).json({ error: 'No users found in team' });
      return;
    }
    const userIds = users.map(u => u.id);
    const tokens = await prisma.fcmToken.findMany({ where: { userId: { in: userIds } } });
    
    if (tokens.length === 0) {
      res.status(404).json({ error: 'No FCM tokens found for team users' });
      return;
    }
    const fcmTokens = tokens.map(t => t.token);

    if (admin.apps.length === 0) {
      res.status(500).json({ error: 'Firebase Admin not initialized properly' });
      return;
    }

    const result = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title, body }
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'Error sending notification', details: err.message });
  }
});

export default router;
