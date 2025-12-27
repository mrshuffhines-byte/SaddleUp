import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateTrainingPlan } from '../lib/claude';
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

    // Check if plan already exists
    const existingPlan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
    });

    if (existingPlan) {
      return res.status(400).json({ error: 'Training plan already exists' });
    }

    // Generate plan with AI
    const planData = await generateTrainingPlan({
      experienceLevel: profile.experienceLevel,
      primaryGoal: profile.primaryGoal,
      daysPerWeek: profile.daysPerWeek,
      sessionLength: profile.sessionLength,
      ownsHorse: profile.ownsHorse,
      horseDetails: profile.horseDetails || undefined,
    });

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

    await prisma.lesson.createMany({
      data: lessons,
    });

    // Fetch the complete plan with lessons
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
      },
    });

    res.json(completePlan);
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

// Get training plan
router.get('/plan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
      include: {
        lessons: {
          orderBy: [
            { phaseNumber: 'asc' },
            { moduleNumber: 'asc' },
            { lessonNumber: 'asc' },
          ],
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'No training plan found' });
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
    const plan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
    });

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
    const plan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
    });

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
    const plan = await prisma.trainingPlan.findUnique({
      where: { userId: req.userId! },
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

export default router;