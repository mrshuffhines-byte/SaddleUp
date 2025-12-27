import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const onboardingSchema = z.object({
  experienceLevel: z.enum(['complete_beginner', 'some_experience', 'returning_rider', 'experienced']),
  primaryGoal: z.enum(['learn_to_ride', 'learn_to_drive', 'groundwork_only', 'general_horsemanship']),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionLength: z.number().int().min(15),
  ownsHorse: z.boolean(),
  horseDetails: z.string().optional(),
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        trainingPlans: {
          where: { isActive: true },
          include: {
            lessons: {
              orderBy: [
                { phaseNumber: 'asc' },
                { moduleNumber: 'asc' },
                { lessonNumber: 'asc' },
              ],
              take: 10, // Just get a few for overview
            },
            planHorses: {
              include: {
                horse: {
                  select: {
                    id: true,
                    name: true,
                    visibleIdDisplay: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1, // Get most recent active plan for backward compatibility
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Update user profile (onboarding)
router.post('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = onboardingSchema.parse(req.body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId! },
      update: {
        ...data,
        horseDetails: data.horseDetails || null,
        updatedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        ...data,
        horseDetails: data.horseDetails || null,
      },
    });

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
