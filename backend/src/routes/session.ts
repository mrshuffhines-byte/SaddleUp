import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const createSessionSchema = z.object({
  lessonId: z.string(),
  sessionDate: z.string().datetime().optional(),
  duration: z.number().int().min(1),
  rating: z.number().int().min(1).max(5),
  notes: z.string().optional(),
  horseNotes: z.string().optional(),
});

// Create session
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createSessionSchema.parse(req.body);

    // Verify lesson exists and belongs to user's plan
    const plan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
    });

    if (!plan) {
      return res.status(404).json({ error: 'No training plan found' });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        planId: plan.id,
        lessonId: data.lessonId,
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const session = await prisma.session.create({
      data: {
        userId: req.userId!,
        lessonId: lesson.id,
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : new Date(),
        duration: data.duration,
        rating: data.rating,
        notes: data.notes || null,
        horseNotes: data.horseNotes || null,
      },
      include: {
        lesson: true,
      },
    });

    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user sessions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId! },
      include: {
        lesson: true,
      },
      orderBy: { sessionDate: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
      include: {
        lesson: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
