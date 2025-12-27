import { prisma } from './prisma';

interface SkillMapping {
  skillName: string;
  category: string;
  description?: string;
  lessonKeywords: string[]; // Keywords that indicate this skill is relevant
  requiredLessons?: number; // Minimum lessons completed to unlock
}

// Define skills and their mappings to lessons
const SKILL_DEFINITIONS: SkillMapping[] = [
  // Foundation Skills
  {
    skillName: 'Basic Groundwork',
    category: 'Foundation',
    description: 'Basic handling and groundwork exercises',
    lessonKeywords: ['groundwork', 'leading', 'halter', 'basic handling'],
    requiredLessons: 1,
  },
  {
    skillName: 'Leading and Handling',
    category: 'Foundation',
    description: 'Confident leading and safe handling',
    lessonKeywords: ['leading', 'walk', 'stop', 'handler'],
    requiredLessons: 2,
  },
  {
    skillName: 'Safety Awareness',
    category: 'Safety',
    description: 'Understanding safe horse handling practices',
    lessonKeywords: ['safety', 'danger', 'precautions', 'safe handling'],
    requiredLessons: 1,
  },
  
  // Riding Skills
  {
    skillName: 'Mounting',
    category: 'Riding',
    description: 'Safe mounting technique',
    lessonKeywords: ['mount', 'mounting', 'getting on', 'first mount'],
    requiredLessons: 1,
  },
  {
    skillName: 'Walk',
    category: 'Riding',
    description: 'Controlled walk with good seat',
    lessonKeywords: ['walk', 'walking', 'first ride'],
    requiredLessons: 2,
  },
  {
    skillName: 'Trot',
    category: 'Riding',
    description: 'Trot with balance and rhythm',
    lessonKeywords: ['trot', 'trotting', 'posting trot', 'sitting trot'],
    requiredLessons: 3,
  },
  {
    skillName: 'Canter',
    category: 'Riding',
    description: 'Canter with control and balance',
    lessonKeywords: ['canter', 'lope', 'canter transition'],
    requiredLessons: 1,
  },
  {
    skillName: 'Transitions',
    category: 'Riding',
    description: 'Smooth transitions between gaits',
    lessonKeywords: ['transition', 'gait change', 'walk-trot', 'trot-canter'],
    requiredLessons: 4,
  },
  
  // Groundwork Skills
  {
    skillName: 'Lunging',
    category: 'Groundwork',
    description: 'Basic lunging technique',
    lessonKeywords: ['lunging', 'lunge', 'circle work'],
    requiredLessons: 2,
  },
  {
    skillName: 'Desensitization',
    category: 'Groundwork',
    description: 'Desensitizing exercises',
    lessonKeywords: ['desensitize', 'sacking out', 'fear', 'spooky'],
    requiredLessons: 2,
  },
  {
    skillName: 'Ground Driving',
    category: 'Groundwork',
    description: 'Long-lining and ground driving',
    lessonKeywords: ['long line', 'long-lining', 'ground drive', 'driving'],
    requiredLessons: 3,
  },
  
  // Horsemanship Skills
  {
    skillName: 'Grooming',
    category: 'Horsemanship',
    description: 'Basic grooming and care',
    lessonKeywords: ['groom', 'brushing', 'hoof care', 'coat'],
    requiredLessons: 1,
  },
  {
    skillName: 'Tack Fitting',
    category: 'Horsemanship',
    description: 'Proper tack fitting and adjustment',
    lessonKeywords: ['saddle', 'bridle', 'fitting', 'tack'],
    requiredLessons: 2,
  },
  {
    skillName: 'Trail Basics',
    category: 'Horsemanship',
    description: 'Basic trail riding skills',
    lessonKeywords: ['trail', 'obstacle', 'outside', 'trail ride'],
    requiredLessons: 3,
  },
];

/**
 * Check and unlock skills based on completed lessons
 */
export async function checkAndUnlockSkills(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      trainingPlan: {
        include: {
          lessons: {
            where: { isCompleted: true },
          },
        },
      },
      userSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!user?.trainingPlan) {
    return [];
  }

  const completedLessons = user.trainingPlan.lessons;
  const unlockedSkillIds = new Set(user.userSkills.map(us => us.skillId));
  const newlyUnlocked: string[] = [];

  // Process each skill definition
  for (const skillDef of SKILL_DEFINITIONS) {
    // Check if skill already exists in database
    let skill = await prisma.skill.findUnique({
      where: { name: skillDef.skillName },
    });

    if (!skill) {
      // Create skill if it doesn't exist
      skill = await prisma.skill.create({
        data: {
          name: skillDef.skillName,
          category: skillDef.category,
          description: skillDef.description || null,
        },
      });
    }

    // Skip if already unlocked
    if (unlockedSkillIds.has(skill.id)) {
      continue;
    }

    // Check if user has completed relevant lessons
    const relevantLessons = completedLessons.filter(lesson => {
      const lessonContent = lesson.content as any;
      const titleLower = lesson.title.toLowerCase();
      const contentLower = JSON.stringify(lessonContent).toLowerCase();
      
      return skillDef.lessonKeywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase()) || 
        contentLower.includes(keyword.toLowerCase())
      );
    });

    // Check if minimum lesson count is met
    if (relevantLessons.length >= (skillDef.requiredLessons || 1)) {
      // Unlock the skill
      await prisma.userSkill.create({
        data: {
          userId,
          skillId: skill.id,
        },
      });

      newlyUnlocked.push(skill.name);
    }
  }

  return newlyUnlocked;
}

/**
 * Get user's skills grouped by category
 */
export async function getUserSkills(userId: string) {
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: {
      skill: true,
    },
    orderBy: { unlockedAt: 'asc' },
  });

  // Group by category
  const skillsByCategory: Record<string, typeof userSkills> = {};
  
  userSkills.forEach(us => {
    const category = us.skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(us);
  });

  return {
    all: userSkills,
    byCategory: skillsByCategory,
    total: userSkills.length,
  };
}

/**
 * Get milestone achievements based on skills and progress
 */
export async function getMilestones(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
    trainingPlans: {
      where: { isActive: true },
      include: {
        lessons: true,
      },
      take: 1, // Get most recent active plan
    },
      userSkills: true,
    },
  });

  if (!user?.trainingPlan) {
    return [];
  }

  const milestones = [];
  const totalLessons = user.trainingPlan.lessons.length;
  const completedLessons = user.trainingPlan.lessons.filter(l => l.isCompleted).length;
  const totalSkills = user.userSkills.length;
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Lesson milestones
  if (completedLessons >= 1 && completedLessons < 5) {
    milestones.push({
      type: 'first_lesson',
      title: 'First Steps',
      description: 'Completed your first lesson!',
      achieved: true,
      achievedAt: user.trainingPlan.lessons.find(l => l.isCompleted)?.completedAt,
    });
  }

  if (completedLessons >= 5) {
    milestones.push({
      type: 'five_lessons',
      title: 'Building Momentum',
      description: 'Completed 5 lessons',
      achieved: true,
    });
  }

  if (completedLessons >= 10) {
    milestones.push({
      type: 'ten_lessons',
      title: 'Dedicated Learner',
      description: 'Completed 10 lessons',
      achieved: true,
    });
  }

  if (completionPercentage >= 50) {
    milestones.push({
      type: 'halfway',
      title: 'Halfway There!',
      description: 'Completed 50% of your training plan',
      achieved: true,
    });
  }

  if (completionPercentage >= 100) {
    milestones.push({
      type: 'complete',
      title: 'Training Plan Complete!',
      description: 'Completed all lessons in your training plan',
      achieved: true,
    });
  }

  // Skill milestones
  if (totalSkills >= 5) {
    milestones.push({
      type: 'five_skills',
      title: 'Skill Builder',
      description: 'Unlocked 5 skills',
      achieved: true,
    });
  }

  if (totalSkills >= 10) {
    milestones.push({
      type: 'ten_skills',
      title: 'Expert Learner',
      description: 'Unlocked 10 skills',
      achieved: true,
    });
  }

  return milestones;
}
