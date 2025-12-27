import express, { Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

const createFacilitySchema = z.object({
  name: z.string().min(1),
  arenaType: z.string().optional(),
  arenaSize: z.string().optional(),
  footing: z.string().optional(),
  roundPen: z.boolean().optional(),
  roundPenSize: z.string().optional(),
  trailAccess: z.string().optional(),
  obstacles: z.array(z.string()).optional(),
  tieSafe: z.string().optional(),
  washRack: z.boolean().optional(),
  pasture: z.boolean().optional(),
  pastureSize: z.string().optional(),
  otherHorses: z.boolean().optional(),
  lighting: z.string().optional(),
  weatherConsiderations: z.string().optional(),
  notes: z.string().optional(),
});

const updateFacilitySchema = createFacilitySchema.partial();

// Get all user's facilities
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: {
        userId: req.userId!,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(facilities);
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single facility
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const facility = await prisma.facility.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json(facility);
  } catch (error) {
    console.error('Get facility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create facility
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createFacilitySchema.parse(req.body);

    const visibleId = generateVisibleId();
    const visibleIdDisplay = `SU-FACILITY-${visibleId}`;

    const facility = await prisma.facility.create({
      data: {
        userId: req.userId!,
        visibleId,
        visibleIdDisplay,
        name: data.name,
        arenaType: data.arenaType,
        arenaSize: data.arenaSize,
        footing: data.footing,
        roundPen: data.roundPen || false,
        roundPenSize: data.roundPenSize,
        trailAccess: data.trailAccess,
        obstacles: data.obstacles || undefined,
        tieSafe: data.tieSafe,
        washRack: data.washRack || false,
        pasture: data.pasture || false,
        pastureSize: data.pastureSize,
        otherHorses: data.otherHorses || false,
        lighting: data.lighting,
        weatherConsiderations: data.weatherConsiderations,
        notes: data.notes,
      },
    });

    res.status(201).json(facility);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create facility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update facility
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateFacilitySchema.parse(req.body);

    const facility = await prisma.facility.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const updated = await prisma.facility.update({
      where: { id: req.params.id },
      data: {
        ...data,
        obstacles: data.obstacles !== undefined ? (data.obstacles || undefined) : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update facility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete facility (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const facility = await prisma.facility.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    await prisma.facility.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete facility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
