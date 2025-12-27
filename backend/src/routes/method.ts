import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Get all methods
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;

    const methods = await prisma.horsemanshipMethod.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json(methods);
  } catch (error) {
    console.error('Get methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single method
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const method = await prisma.horsemanshipMethod.findUnique({
      where: { id: req.params.id },
    });

    if (!method) {
      return res.status(404).json({ error: 'Method not found' });
    }

    res.json(method);
  } catch (error) {
    console.error('Get method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's method preference
router.get('/preference/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const preference = await prisma.userMethodPreference.findUnique({
      where: { userId: req.userId! },
      include: {
        primaryMethod: true,
      },
    });

    res.json(preference);
  } catch (error) {
    console.error('Get method preference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user's method preference
router.post('/preference', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { primaryMethodId, showComparisons } = z.object({
      primaryMethodId: z.string(),
      showComparisons: z.boolean().optional(),
    }).parse(req.body);

    const preference = await prisma.userMethodPreference.upsert({
      where: { userId: req.userId! },
      update: {
        primaryMethodId,
        showComparisons: showComparisons ?? false,
        updatedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        primaryMethodId,
        showComparisons: showComparisons ?? false,
      },
      include: {
        primaryMethod: true,
      },
    });

    res.json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update method preference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
