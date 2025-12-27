import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

const createSavedAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  methodId: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// Save an answer
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createSavedAnswerSchema.parse(req.body);

    const visibleId = generateVisibleId();
    const visibleIdDisplay = `SA-${visibleId}`;

    const savedAnswer = await prisma.savedAnswer.create({
      data: {
        visibleId,
        visibleIdDisplay,
        userId: req.userId!,
        question: data.question,
        answer: data.answer,
        methodId: data.methodId || null,
        mediaUrls: data.mediaUrls || [],
        category: data.category || null,
      },
      include: {
        method: true,
      },
    });

    res.status(201).json(savedAnswer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Save answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's saved answers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;

    const savedAnswers = await prisma.savedAnswer.findMany({
      where: {
        userId: req.userId!,
        ...(category && { category: category as string }),
      },
      include: {
        method: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(savedAnswers);
  } catch (error) {
    console.error('Get saved answers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single saved answer
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const savedAnswer = await prisma.savedAnswer.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
      include: {
        method: true,
      },
    });

    if (!savedAnswer) {
      return res.status(404).json({ error: 'Saved answer not found' });
    }

    res.json(savedAnswer);
  } catch (error) {
    console.error('Get saved answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete saved answer
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.savedAnswer.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete saved answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
