import { Router, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register-token', requireAuth, async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: 'FCM token required' });
    return;
  }
  try {
    const userId = req.user!.id;
    const existing = await prisma.fcmToken.findUnique({ where: { token } });
    if (!existing) {
      await prisma.fcmToken.create({
        data: { token, userId }
      });
    } else if (existing.userId !== userId) {
      await prisma.fcmToken.update({
        where: { token },
        data: { userId }
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error saving FCM token' });
  }
});

export default router;
