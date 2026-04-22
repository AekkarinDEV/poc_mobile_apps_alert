import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { JWT_SECRET } from '../middlewares/authMiddleware';

const router = Router();

router.post('/team', async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const team = await prisma.team.create({ data: { name } });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: 'Error creating team' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { username, password, role, teamId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'USER',
        teamId: teamId || null,
      }
    });
    res.json({ id: user.id, username: user.username, role: user.role, teamId: user.teamId });
  } catch (err: any) {
    res.status(400).json({ error: 'Error registering user', details: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, teamId: user.teamId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, teamId: user.teamId } });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

export default router;
