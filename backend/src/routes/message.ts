import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { generateChatResponse } from '../lib/chat';
import { buildComprehensiveContext } from '../lib/context-builder';

const router = express.Router();

const createMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  mediaUrls: z.array(z.string()).optional(),
  horseId: z.string().optional(),
  facilityId: z.string().optional(),
  weatherContext: z.any().optional(),
  environmentalFactors: z.array(z.string()).optional(),
});

// Create user message and get AI response
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createMessageSchema.parse(req.body);

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: data.conversationId,
        userId: req.userId!,
      },
      include: {
        method: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: 'user',
        content: data.content,
        mediaUrls: data.mediaUrls || [],
      },
    });

    // Get user context for AI
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        profile: true,
        trainingPlans: {
          where: { isActive: true },
          include: {
            lessons: {
              where: { isCompleted: false },
              orderBy: [
                { phaseNumber: 'asc' },
                { moduleNumber: 'asc' },
                { lessonNumber: 'asc' },
              ],
              take: 10,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        methodPreference: {
          include: { primaryMethod: true },
        },
      },
    });

    // Build comprehensive context
    const comprehensiveContext = await buildComprehensiveContext({
      userId: req.userId!,
      horseId: data.horseId,
      facilityId: data.facilityId,
      weatherContext: data.weatherContext,
      environmentalFactors: data.environmentalFactors,
    });

    // Generate AI response
    const aiResponse = await generateChatResponse({
      userMessage: data.content,
      conversationHistory: conversation.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      userContext: {
        experienceLevel: user?.profile?.experienceLevel,
        primaryGoal: user?.profile?.primaryGoal,
                currentLessons: user?.trainingPlans?.[0]?.lessons || [],
        methodPreference: user?.methodPreference?.primaryMethod,
        conversationMethod: conversation.method,
        showComparisons: user?.methodPreference?.showComparisons || false,
      },
      mediaUrls: data.mediaUrls || [],
      comprehensiveContext,
    });

    // Create assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: 'assistant',
        content: aiResponse.content,
        mediaAnalysis: aiResponse.mediaAnalysis || null,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    res.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
