import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

const createConversationSchema = z.object({
  methodId: z.string().optional(),
  title: z.string().optional(),
});

// Create new conversation
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createConversationSchema.parse(req.body);

    const visibleId = generateVisibleId();
    const visibleIdDisplay = `CV-${visibleId}`;

    const conversation = await prisma.conversation.create({
      data: {
        visibleId,
        visibleIdDisplay,
        userId: req.userId!,
        methodId: data.methodId || null,
        title: data.title || null,
      },
      include: {
        method: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's conversations
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId! },
      include: {
        method: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single conversation with messages
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
      include: {
        method: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            mediaUploads: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update conversation
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, methodId } = req.body;

    const conversation = await prisma.conversation.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(methodId !== undefined && { methodId: methodId || null }),
        updatedAt: new Date(),
      },
    });

    if (conversation.count === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete conversation
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.conversation.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
