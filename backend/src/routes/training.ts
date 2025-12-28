import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateTrainingPlan } from '../lib/claude';
import { generateFallbackPlan } from '../lib/fallback-plan';
import { checkAndUnlockSkills, getUserSkills, getMilestones } from '../lib/skills';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

// Generate training plan
router.post('/generate-plan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete onboarding first' });
    }

    const { name, description, horseIds } = req.body;

    // Validate horseIds if provided (max 20 horses)
    let horses: any[] = [];
    if (horseIds && Array.isArray(horseIds)) {
      if (horseIds.length > 20) {
        return res.status(400).json({ error: 'Maximum 20 horses allowed per plan' });
      }
      
      // Verify all horses belong to the user
      horses = await prisma.horse.findMany({
        where: {
          id: { in: horseIds },
          userId: req.userId!,
          isActive: true,
        },
      });

      if (horses.length !== horseIds.length) {
        return res.status(400).json({ error: 'One or more horses not found or do not belong to you' });
      }
    }

    // Generate plan with AI, fallback to basic plan if AI fails
    let planData;
    let usedFallback = false;
    const onboardingData = {
      experienceLevel: profile.experienceLevel,
      primaryGoal: profile.primaryGoal,
      daysPerWeek: profile.daysPerWeek,
      sessionLength: profile.sessionLength,
      ownsHorse: profile.ownsHorse,
      horseDetails: profile.horseDetails || undefined,
    };

    try {
      console.log('Attempting to generate training plan with AI...');
      planData = await generateTrainingPlan(onboardingData);
      console.log(`Successfully generated plan with ${planData.phases.length} phases`);
    } catch (error) {
      console.error('AI training plan generation failed, using fallback plan:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Use fallback plan
      try {
        planData = generateFallbackPlan(onboardingData);
        usedFallback = true;
        console.log(`Fallback plan generated with ${planData.phases.length} phases`);
      } catch (fallbackError) {
        console.error('Fallback plan generation also failed:', fallbackError);
        return res.status(500).json({ 
          error: 'Failed to generate training plan',
          message: 'Both AI and fallback plan generation failed',
          details: process.env.NODE_ENV === 'development' ? (fallbackError instanceof Error ? fallbackError.message : 'Unknown error') : undefined
        });
      }
    }

    // Create visible ID (human-readable)
    const visibleId = generateVisibleId();
    const visibleIdDisplay = `SU-${visibleId}`;

    // Create training plan
    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        visibleId,
        visibleIdDisplay,
        userId: req.userId!,
        goal: profile.primaryGoal,
        generatedContent: planData as any,
        currentPhase: 1,
        currentModule: 1,
        name: name || undefined,
        description: description || undefined,
        planHorses: horses.length > 0 ? {
          create: horses.map(horse => ({
            horseId: horse.id,
          })),
        } : undefined,
      },
    });

    // Create lesson records
    const lessons = [];
    for (const phase of planData.phases) {
      for (const module of phase.modules) {
        for (const lesson of module.lessons) {
          const lessonId = `F${phase.phaseNumber}-M${module.moduleNumber}-L${lesson.lessonNumber}`;
          lessons.push({
            lessonId,
            lessonTitle: lesson.title,
            planId: trainingPlan.id,
            phaseNumber: phase.phaseNumber,
            moduleNumber: module.moduleNumber,
            lessonNumber: lesson.lessonNumber,
            title: lesson.title,
            content: lesson as any,
          });
        }
      }
    }

    if (lessons.length === 0) {
      console.error('No lessons generated in plan!');
      return res.status(500).json({ 
        error: 'Failed to generate training plan',
        message: 'Plan was created but contains no lessons',
        details: 'This should not happen - please contact support'
      });
    }

    console.log(`Creating ${lessons.length} lesson records...`);
    await prisma.lesson.createMany({
      data: lessons,
    });
    console.log(`Successfully created ${lessons.length} lessons`);

    // Fetch the complete plan with lessons and horses
    const completePlan = await prisma.trainingPlan.findUnique({
      where: { id: trainingPlan.id },
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
        },
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
    });

    if (!completePlan) {
      console.error('Plan was created but could not be retrieved');
      return res.status(500).json({ 
        error: 'Failed to retrieve created plan',
        message: 'Plan was created but could not be retrieved'
      });
    }

    res.json({
      ...completePlan,
      _meta: {
        usedFallback,
        lessonCount: completePlan.lessons.length,
      }
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ 
      error: 'Failed to generate training plan',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
});

// Get all training plans
router.get('/plans', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.query;
    const where: any = { userId: req.userId! };
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const plans = await prisma.trainingPlan.findMany({
      where,
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
          take: 1, // Just get count info
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
        _count: {
          select: {
            lessons: true,
            planHorses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single training plan by ID
router.get('/plan/:planId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
        },
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active/default training plan (backward compatibility)
router.get('/plan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        userId: req.userId!,
        isActive: true,
      },
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
        },
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      return res.status(404).json({ error: 'No active training plan found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single lesson
router.get('/lesson/:lessonId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.query;
    
    let plan;
    if (planId) {
      // Get lesson from specific plan
      plan = await prisma.trainingPlan.findFirst({
        where: {
          id: planId as string,
          userId: req.userId!,
        },
      });
    } else {
      // Get lesson from active plan (backward compatibility)
      plan = await prisma.trainingPlan.findFirst({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!plan) {
      return res.status(404).json({ error: 'No training plan found' });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        planId: plan.id,
        lessonId: req.params.lessonId,
      },
      include: {
        sessions: {
          where: { userId: req.userId! },
          orderBy: { sessionDate: 'desc' },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark lesson as complete
router.patch('/lesson/:lessonId/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    
    let plan;
    if (planId) {
      // Get lesson from specific plan
      plan = await prisma.trainingPlan.findFirst({
        where: {
          id: planId,
          userId: req.userId!,
        },
      });
    } else {
      // Get lesson from active plan (backward compatibility)
      plan = await prisma.trainingPlan.findFirst({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!plan) {
      return res.status(404).json({ error: 'No training plan found' });
    }

    const lesson = await prisma.lesson.updateMany({
      where: {
        planId: plan.id,
        lessonId: req.params.lessonId,
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    if (lesson.count === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check and unlock skills after lesson completion
    const newlyUnlocked = await checkAndUnlockSkills(req.userId!);

    res.json({ 
      success: true,
      newlyUnlockedSkills: newlyUnlocked,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user skills
router.get('/skills', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const skills = await getUserSkills(req.userId!);
    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get milestones
router.get('/milestones', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const milestones = await getMilestones(req.userId!);
    res.json(milestones);
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get suggested questions based on current lesson
router.get('/suggested-questions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.query;
    
    let plan;
    if (planId) {
      plan = await prisma.trainingPlan.findFirst({
        where: {
          id: planId as string,
          userId: req.userId!,
        },
        include: {
          lessons: {
            where: { isCompleted: false },
            orderBy: [
              { phaseNumber: 'asc' },
              { moduleNumber: 'asc' },
              { lessonNumber: 'asc' },
            ],
            take: 3,
          },
        },
      });
    } else {
      // Get from active plan (backward compatibility)
      plan = await prisma.trainingPlan.findFirst({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        include: {
          lessons: {
            where: { isCompleted: false },
            orderBy: [
              { phaseNumber: 'asc' },
              { moduleNumber: 'asc' },
              { lessonNumber: 'asc' },
            ],
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!plan || !plan.lessons || plan.lessons.length === 0) {
      return res.json({ questions: [] });
    }

    const currentLesson = plan.lessons[0];
    const lessonTitle = currentLesson.title;
    const lessonContent = currentLesson.content as any;

    // Generate suggested questions based on lesson
    const suggestedQuestions: string[] = [];

    // General questions about the lesson
    suggestedQuestions.push(`What should I know before starting "${lessonTitle}"?`);
    suggestedQuestions.push(`How do I know if I'm doing "${lessonTitle}" correctly?`);
    suggestedQuestions.push(`What are common mistakes to avoid in "${lessonTitle}"?`);

    // Questions about equipment if mentioned
    if (lessonContent.equipment && lessonContent.equipment.length > 0) {
      suggestedQuestions.push(`What equipment do I need for "${lessonTitle}"?`);
    }

    // Safety-related questions
    if (lessonContent.safetyNotes && lessonContent.safetyNotes.length > 0) {
      suggestedQuestions.push(`Are there safety concerns with "${lessonTitle}"?`);
    }

    // Questions about moving on
    if (lessonContent.moveOnWhen && lessonContent.moveOnWhen.length > 0) {
      suggestedQuestions.push(`How do I know when I'm ready to move on from "${lessonTitle}"?`);
    }

    // Limit to 5 questions
    res.json({ questions: suggestedQuestions.slice(0, 5) });
  } catch (error) {
    console.error('Get suggested questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update training plan
router.patch('/plan/:planId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isActive, currentPhase, currentModule } = req.body;

    // Verify plan belongs to user
    const existingPlan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    // Update plan
    const updatedPlan = await prisma.trainingPlan.update({
      where: { id: req.params.planId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        currentPhase: currentPhase !== undefined ? currentPhase : undefined,
        currentModule: currentModule !== undefined ? currentModule : undefined,
      },
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
        },
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign horses to a plan
router.post('/plan/:planId/horses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { horseIds } = req.body;

    if (!Array.isArray(horseIds) || horseIds.length === 0) {
      return res.status(400).json({ error: 'horseIds must be a non-empty array' });
    }

    if (horseIds.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 horses allowed per plan' });
    }

    // Verify plan belongs to user
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    // Verify all horses belong to the user
    const horses = await prisma.horse.findMany({
      where: {
        id: { in: horseIds },
        userId: req.userId!,
        isActive: true,
      },
    });

    if (horses.length !== horseIds.length) {
      return res.status(400).json({ error: 'One or more horses not found or do not belong to you' });
    }

    // Remove existing assignments for this plan
    await prisma.planHorse.deleteMany({
      where: { planId: req.params.planId },
    });

    // Create new assignments
    await prisma.planHorse.createMany({
      data: horseIds.map((horseId: string) => ({
        planId: req.params.planId,
        horseId,
      })),
    });

    // Fetch updated plan
    const updatedPlan = await prisma.trainingPlan.findUnique({
      where: { id: req.params.planId },
      include: {
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Assign horses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a single horse to a plan
router.post('/plan/:planId/horses/:horseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Verify plan belongs to user
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
      include: {
        _count: {
          select: { planHorses: true },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    // Check horse limit
    if (plan._count.planHorses >= 20) {
      return res.status(400).json({ error: 'Maximum 20 horses allowed per plan' });
    }

    // Verify horse belongs to user
    const horse = await prisma.horse.findFirst({
      where: {
        id: req.params.horseId,
        userId: req.userId!,
        isActive: true,
      },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found or does not belong to you' });
    }

    // Check if already assigned
    const existing = await prisma.planHorse.findUnique({
      where: {
        planId_horseId: {
          planId: req.params.planId,
          horseId: req.params.horseId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Horse is already assigned to this plan' });
    }

    // Add horse to plan
    await prisma.planHorse.create({
      data: {
        planId: req.params.planId,
        horseId: req.params.horseId,
      },
    });

    // Fetch updated plan
    const updatedPlan = await prisma.trainingPlan.findUnique({
      where: { id: req.params.planId },
      include: {
        planHorses: {
          include: {
            horse: true,
          },
        },
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Add horse to plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a horse from a plan
router.delete('/plan/:planId/horses/:horseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Verify plan belongs to user
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    // Remove horse from plan
    const result = await prisma.planHorse.deleteMany({
      where: {
        planId: req.params.planId,
        horseId: req.params.horseId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Horse is not assigned to this plan' });
    }

    res.json({ success: true, message: 'Horse removed from plan' });
  } catch (error) {
    console.error('Remove horse from plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a training plan
router.delete('/plan/:planId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Verify plan belongs to user
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.userId!,
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    // Delete plan (cascades to lessons and planHorses)
    await prisma.trainingPlan.delete({
      where: { id: req.params.planId },
    });

    res.json({ success: true, message: 'Training plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;