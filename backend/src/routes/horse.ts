import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

const createHorseSchema = z.object({
  name: z.string().min(1),
  breed: z.string().optional(),
  age: z.string().optional(), // Under 5, 5-10, 11-17, 18+
  sex: z.string().optional(),
  height: z.string().optional(),
  weight: z.number().optional(),
  temperament: z.union([z.string(), z.array(z.string())]).optional(), // Can be single value or array
  energyLevel: z.enum(['high', 'medium', 'low']).optional(),
  learningStyle: z.array(z.string()).optional(),
  primaryUse: z.array(z.string()).optional(),
  trainingLevel: z.enum(['untrained', 'green', 'trained', 'well-trained']).optional(),
  isProfessionallyTrained: z.boolean().nullable().optional(),
  trainingHistory: z.array(z.any()).optional(),
  knownCues: z.array(z.any()).optional(),
  knownIssues: z.array(z.string()).optional(), // biting, kicking, rearing, bolting, etc.
  injuries: z.array(z.any().optional()).optional(),
  healthConditions: z.array(z.string()).optional(),
  pastTrauma: z.array(z.string()).optional(),
  goodWith: z.array(z.string()).optional(),
  struggles: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateHorseSchema = createHorseSchema.partial();

// Get all user's horses
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const horses = await prisma.horse.findMany({
      where: {
        userId: req.userId!,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(horses);
  } catch (error) {
    console.error('Get horses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single horse
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const horse = await prisma.horse.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
      include: {
        sessions: {
          orderBy: { sessionDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    res.json(horse);
  } catch (error) {
    console.error('Get horse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create horse
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createHorseSchema.parse(req.body);

    const visibleId = generateVisibleId();
    const visibleIdDisplay = `SU-HORSE-${visibleId}`;

    const horse = await prisma.horse.create({
      data: {
        userId: req.userId!,
        visibleId,
        visibleIdDisplay,
        name: data.name,
        breed: data.breed,
        age: data.age,
        sex: data.sex,
        height: data.height,
        weight: data.weight,
        temperament: data.temperament || undefined,
        energyLevel: data.energyLevel,
        learningStyle: data.learningStyle || undefined,
        primaryUse: data.primaryUse || undefined,
        trainingHistory: data.trainingHistory || undefined,
        knownCues: data.knownCues || undefined,
        injuries: data.injuries || undefined,
        healthConditions: data.healthConditions || undefined,
        pastTrauma: data.pastTrauma || undefined,
        goodWith: data.goodWith || undefined,
        struggles: data.struggles || undefined,
        notes: data.notes,
      },
    });

    res.status(201).json(horse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create horse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update horse
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateHorseSchema.parse(req.body);

    const horse = await prisma.horse.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

            // Normalize temperament if provided
            let temperamentValue: any = undefined;
            if (data.temperament !== undefined) {
              if (typeof data.temperament === 'string') {
                temperamentValue = [data.temperament];
              } else if (Array.isArray(data.temperament)) {
                temperamentValue = data.temperament;
              } else {
                temperamentValue = undefined;
              }
            }

            const updated = await prisma.horse.update({
              where: { id: req.params.id },
              data: {
                name: data.name,
                breed: data.breed,
                age: data.age,
                sex: data.sex,
                height: data.height,
                weight: data.weight,
                temperament: temperamentValue !== undefined ? temperamentValue : undefined,
                energyLevel: data.energyLevel,
                learningStyle: data.learningStyle !== undefined ? (data.learningStyle || undefined) : undefined,
                primaryUse: data.primaryUse !== undefined ? (data.primaryUse || undefined) : undefined,
                trainingLevel: data.trainingLevel,
                isProfessionallyTrained: data.isProfessionallyTrained !== undefined ? (data.isProfessionallyTrained ?? undefined) : undefined,
                trainingHistory: data.trainingHistory !== undefined ? (data.trainingHistory || undefined) : undefined,
                knownCues: data.knownCues !== undefined ? (data.knownCues || undefined) : undefined,
                knownIssues: data.knownIssues !== undefined ? (data.knownIssues || undefined) : undefined,
                injuries: data.injuries !== undefined ? (data.injuries || undefined) : undefined,
                healthConditions: data.healthConditions !== undefined ? (data.healthConditions || undefined) : undefined,
                pastTrauma: data.pastTrauma !== undefined ? (data.pastTrauma || undefined) : undefined,
                goodWith: data.goodWith !== undefined ? (data.goodWith || undefined) : undefined,
                struggles: data.struggles !== undefined ? (data.struggles || undefined) : undefined,
                notes: data.notes,
              },
            });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update horse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete horse (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const horse = await prisma.horse.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    await prisma.horse.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete horse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
