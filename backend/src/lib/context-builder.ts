import { prisma } from './prisma';

/**
 * Builds comprehensive context for AI responses including:
 * - Horse profile (if specified)
 * - Rider profile with multiple method experience
 * - Facility information
 * - Weather/environmental context
 */
export interface ComprehensiveContext {
  horse?: any;
  rider: {
    profile?: any;
    methodPreference?: string;
    selectedMethods?: string[];
    methodExperience?: any[];
    methodRatings?: any[];
    physicalLimitations?: any[];
    confidenceAreas?: any[];
    struggleAreas?: any[];
    learningStyle?: string;
    riskTolerance?: string;
  };
  facility?: any;
  weatherContext?: {
    temperature?: number;
    wind?: string;
    precipitation?: string;
    timeOfDay?: string;
    seasonalConsiderations?: string;
  };
  environmentalFactors?: string[];
}

export async function buildComprehensiveContext(params: {
  userId: string;
  horseId?: string;
  facilityId?: string;
  weatherContext?: any;
  environmentalFactors?: string[];
}): Promise<ComprehensiveContext> {
  const { userId, horseId, facilityId, weatherContext, environmentalFactors } = params;

  // Get user with full profile and method preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      methodPreference: {
        include: {
          primaryMethod: true,
        },
      },
    },
  });

  // Get horse if specified
  let horse = null;
  if (horseId) {
    horse = await prisma.horse.findFirst({
      where: {
        id: horseId,
        userId,
      },
    });
  } else {
    // Get active horses to provide general context
    const horses = await prisma.horse.findMany({
      where: {
        userId,
        isActive: true,
      },
      take: 1,
    });
    horse = horses[0] || null;
  }

  // Get facility if specified
  let facility = null;
  if (facilityId) {
    facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        userId,
      },
    });
  } else {
    // Get primary facility
    const facilities = await prisma.facility.findMany({
      where: {
        userId,
        isActive: true,
      },
      take: 1,
    });
    facility = facilities[0] || null;
  }

  // Build method experience from both profile and preferences
  const methodRatings = user?.methodPreference?.methodRatings as any[] || [];
  
  // Use type assertion and optional chaining for fields not yet in schema
  const profile = user?.profile as any;
  const methodPreference = profile?.methodPreference || 'explore';
  const selectedMethods = profile?.selectedMethods as string[] || [];
  const experiencedMethods = profile?.experiencedMethods || [];
  const physicalLimitations = profile?.physicalLimitations || [];
  const confidenceAreas = profile?.confidenceAreas || [];
  const struggleAreas = profile?.struggleAreas || [];
  const learningStyle = profile?.learningStyle;
  const riskTolerance = profile?.riskTolerance;
  
  // Combine and enrich with method details
  const methodExperience: any[] = [];
  const methodMap = new Map();
  const methodIdsToFetch = new Set<string>();

  // Add from profile selectedMethods (from onboarding)
  if (selectedMethods && Array.isArray(selectedMethods) && selectedMethods.length > 0) {
    selectedMethods.forEach((methodId: string) => {
      methodIdsToFetch.add(methodId);
      methodMap.set(methodId, {
        methodId,
        comfortLevel: 3, // Default to medium if no rating yet
        yearsExperience: 0,
        source: 'onboarding',
      });
    });
  }

  // Add from methodRatings
  if (methodRatings && Array.isArray(methodRatings)) {
    methodRatings.forEach((mr: any) => {
      methodIdsToFetch.add(mr.methodId);
      methodMap.set(mr.methodId, {
        methodId: mr.methodId,
        comfortLevel: mr.comfortLevel || 3,
        yearsExperience: mr.yearsExperience || 0,
        source: 'preferences',
      });
    });
  }

  // Add from profile experiencedMethods
  if (experiencedMethods && Array.isArray(experiencedMethods)) {
    experiencedMethods.forEach((em: any) => {
      methodIdsToFetch.add(em.methodId);
      const existing = methodMap.get(em.methodId);
      if (!existing || existing.comfortLevel < em.comfortLevel) {
        methodMap.set(em.methodId, {
          methodId: em.methodId,
          comfortLevel: em.comfortLevel || 3,
          yearsExperience: em.yearsExperience || 0,
          source: 'profile',
        });
      }
    });
  }

  // Fetch method details for each
  if (methodIdsToFetch.size > 0) {
    const methods = await prisma.horsemanshipMethod.findMany({
      where: {
        id: { in: Array.from(methodIdsToFetch) },
      },
    });

    methods.forEach((method) => {
      const rating = methodMap.get(method.id);
      if (rating) {
        methodExperience.push({
          ...rating,
          method: {
            id: method.id,
            name: method.name,
            category: method.category,
            philosophy: method.philosophy,
            keyPrinciples: method.keyPrinciples,
            commonTerminology: method.commonTerminology,
          },
        });
      }
    });
  }

  return {
    horse: horse || undefined,
    rider: {
      profile: user?.profile || undefined,
      methodPreference: methodPreference,
      selectedMethods: selectedMethods.length > 0 ? selectedMethods : undefined,
      methodExperience: methodExperience.length > 0 ? methodExperience : undefined,
      methodRatings: methodRatings.length > 0 ? methodRatings : undefined,
      physicalLimitations: (user?.profile as any)?.physicalLimitations as any[] || undefined,
      confidenceAreas: (user?.profile as any)?.confidenceAreas as any[] || undefined,
      struggleAreas: (user?.profile as any)?.struggleAreas as any[] || undefined,
      learningStyle: (user?.profile as any)?.learningStyle || undefined,
      riskTolerance: (user?.profile as any)?.riskTolerance || undefined,
    },
    facility: facility || undefined,
    weatherContext: weatherContext || undefined,
    environmentalFactors: environmentalFactors || undefined,
  };
}

/**
 * Builds AI prompt context from comprehensive context
 */
export function buildAIContextPrompt(context: ComprehensiveContext): string {
  let prompt = '';

  // Horse context
  if (context.horse) {
    prompt += `\n**HORSE PROFILE:**\n`;
    prompt += `Name: ${context.horse.name}\n`;
    if (context.horse.breed) prompt += `Breed: ${context.horse.breed}\n`;
    if (context.horse.age) prompt += `Age: ${context.horse.age}\n`;
    if (context.horse.sex) prompt += `Sex: ${context.horse.sex}\n`;
    if (context.horse.temperament) {
      const temp = Array.isArray(context.horse.temperament) 
        ? context.horse.temperament.join(', ') 
        : String(context.horse.temperament);
      prompt += `Temperament: ${temp}\n`;
      
      // Add safety warning for unpredictable horses
      const tempStr = temp.toLowerCase();
      if (tempStr.includes('unpredictable')) {
        prompt += `⚠️ **CRITICAL SAFETY WARNING: This horse is unpredictable. Always emphasize safety, recommend professional supervision for any hands-on work, and suggest starting with very basic, low-risk exercises.**\n`;
      }
    }
    if (context.horse.energyLevel) prompt += `Energy Level: ${context.horse.energyLevel}\n`;
    if (context.horse.learningStyle) {
      prompt += `Learning Style: ${JSON.stringify(context.horse.learningStyle)}\n`;
    }
    if (context.horse.trainingLevel) {
      prompt += `Training Level: ${context.horse.trainingLevel}\n`;
    }
    if (context.horse.isProfessionallyTrained !== undefined && context.horse.isProfessionallyTrained !== null) {
      prompt += `Professionally Trained: ${context.horse.isProfessionallyTrained ? 'Yes' : 'No'}\n`;
    }
    if (context.horse.knownIssues && Array.isArray(context.horse.knownIssues) && context.horse.knownIssues.length > 0) {
      prompt += `Known Issues: ${context.horse.knownIssues.join(', ')}\n`;
      prompt += `**IMPORTANT: This horse has behavioral issues. Provide specific, safe strategies for working with these challenges.**\n`;
    }
    if (context.horse.injuries && Array.isArray(context.horse.injuries) && context.horse.injuries.length > 0) {
      prompt += `Injuries/Health: ${JSON.stringify(context.horse.injuries)}\n`;
      prompt += `**IMPORTANT: Adapt all recommendations to accommodate these physical limitations.**\n`;
    }
    if (context.horse.healthConditions) {
      prompt += `Health Conditions: ${JSON.stringify(context.horse.healthConditions)}\n`;
    }
    if (context.horse.pastTrauma) {
      prompt += `Past Trauma: ${JSON.stringify(context.horse.pastTrauma)}\n`;
      prompt += `**IMPORTANT: Avoid triggers and build confidence gradually.**\n`;
    }
    if (context.horse.trainingHistory) {
      prompt += `Training History: ${JSON.stringify(context.horse.trainingHistory)}\n`;
    }
    if (context.horse.knownCues) {
      prompt += `Known Cues: ${JSON.stringify(context.horse.knownCues)}\n`;
    }
    if (context.horse.struggles) {
      prompt += `Areas of Difficulty: ${JSON.stringify(context.horse.struggles)}\n`;
    }
    if (context.horse.goodWith) {
      prompt += `Strengths: ${JSON.stringify(context.horse.goodWith)}\n`;
    }
    prompt += '\n';
  }

  // Rider context
  if (context.rider.profile) {
    prompt += `\n**RIDER PROFILE:**\n`;
    prompt += `Experience Level: ${context.rider.profile.experienceLevel}\n`;
    if (context.rider.profile.returningTimeGap) {
      prompt += `Time away from horses: ${context.rider.profile.returningTimeGap} years\n`;
    }
    if (context.rider.profile.horseAccess && !context.rider.profile.ownsHorse) {
      prompt += `Horse Access: ${context.rider.profile.horseAccess}\n`;
    }
    if (context.rider.learningStyle) {
      prompt += `Learning Style: ${context.rider.learningStyle}\n`;
    }
    if (context.rider.riskTolerance) {
      prompt += `Risk Tolerance: ${context.rider.riskTolerance}\n`;
    }
    if (context.rider.physicalLimitations) {
      prompt += `Physical Limitations: ${JSON.stringify(context.rider.physicalLimitations)}\n`;
      prompt += `**IMPORTANT: Adapt all recommendations to accommodate these limitations.**\n`;
    }
    if (context.rider.confidenceAreas) {
      prompt += `Confidence Areas: ${JSON.stringify(context.rider.confidenceAreas)}\n`;
    }
    if (context.rider.struggleAreas) {
      prompt += `Struggle Areas: ${JSON.stringify(context.rider.struggleAreas)}\n`;
    }
    prompt += '\n';
  }

  // Method preference and selected methods
  if (context.rider.methodPreference) {
    const preference = context.rider.methodPreference;
    const selectedMethodIds = context.rider.selectedMethods || [];
    
    prompt += `\n**METHOD PREFERENCE:**\n`;
    if (preference === 'explore') {
      prompt += `The rider wants to explore all methods - draw from various training approaches as appropriate, introducing different perspectives and techniques.\n`;
    } else if (preference === 'blend') {
      prompt += `The rider wants to blend multiple methods. `;
      if (selectedMethodIds.length > 0) {
        prompt += `They've selected these methods as of interest:\n`;
        // Fetch method names for selected IDs
        if (context.rider.methodExperience) {
          const selectedMethods = context.rider.methodExperience.filter((me: any) => 
            selectedMethodIds.includes(me.method.id)
          );
          selectedMethods.forEach((me: any) => {
            prompt += `- ${me.method.name} (${me.method.category})\n`;
          });
        }
        prompt += `\nBlend techniques from these selected methods, showing how they complement each other. Explain which method each technique comes from when blending.\n`;
      }
    } else if (preference === 'single') {
      prompt += `The rider wants to focus on a single method. `;
      if (selectedMethodIds.length > 0 && context.rider.methodExperience) {
        const primaryMethod = context.rider.methodExperience.find((me: any) => 
          selectedMethodIds[0] === me.method.id
        );
        if (primaryMethod) {
          prompt += `Focus on: ${primaryMethod.method.name} (${primaryMethod.method.category})\n`;
          if (primaryMethod.method.philosophy) {
            prompt += `Philosophy: ${primaryMethod.method.philosophy}\n`;
          }
          if (primaryMethod.method.keyPrinciples) {
            prompt += `Key Principles: ${JSON.stringify(primaryMethod.method.keyPrinciples)}\n`;
          }
          if (primaryMethod.method.commonTerminology) {
            prompt += `Common Terminology: ${JSON.stringify(primaryMethod.method.commonTerminology)}\n`;
          }
          prompt += `\nFrame all recommendations through this method's perspective, use its terminology, and reference its specific exercises or principles.\n`;
        }
      }
    }
    prompt += '\n';
  }

  // Method experience
  if (context.rider.methodExperience && context.rider.methodExperience.length > 0) {
    prompt += `\n**RIDER METHOD EXPERIENCE:**\n`;
    prompt += `The rider has experience with the following methods:\n`;
    context.rider.methodExperience.forEach((me: any) => {
      prompt += `- ${me.method.name} (${me.method.category}): Comfort level ${me.comfortLevel}/5, ${me.yearsExperience} years experience\n`;
      if (me.method.philosophy) {
        prompt += `  Philosophy: ${me.method.philosophy}\n`;
      }
      if (me.method.keyPrinciples) {
        prompt += `  Key Principles: ${JSON.stringify(me.method.keyPrinciples)}\n`;
      }
    });
    
    if (context.rider.methodPreference === 'blend' || context.rider.methodPreference === 'explore') {
      prompt += `\n**INSTRUCTIONS FOR METHOD BLENDING:**\n`;
      prompt += `- Blend techniques from methods the rider has experience with (higher comfort levels)\n`;
      prompt += `- Reference familiar terminology and exercises from their known methods\n`;
      prompt += `- For methods with lower comfort levels, provide more detailed explanations\n`;
      prompt += `- When blending methods, explain which method each technique comes from\n`;
      prompt += `- Prioritize methods where the rider has higher comfort levels\n`;
      prompt += `- Show how different methods approach similar concepts\n`;
      prompt += `- Adapt techniques based on what works best for the specific horse-rider combination\n`;
    }
    prompt += '\n';
  }

  // Facility context
  if (context.facility) {
    prompt += `\n**FACILITY:**\n`;
    prompt += `Name: ${context.facility.name}\n`;
    if (context.facility.arenaType) prompt += `Arena Type: ${context.facility.arenaType}\n`;
    if (context.facility.arenaSize) prompt += `Arena Size: ${context.facility.arenaSize}\n`;
    if (context.facility.footing) prompt += `Footing: ${context.facility.footing}\n`;
    if (context.facility.roundPen) {
      prompt += `Has Round Pen: Yes${context.facility.roundPenSize ? ` (${context.facility.roundPenSize})` : ''}\n`;
    } else {
      prompt += `Has Round Pen: No - adapt exercises accordingly\n`;
    }
    if (context.facility.trailAccess) prompt += `Trail Access: ${context.facility.trailAccess}\n`;
    if (context.facility.obstacles) {
      prompt += `Available Obstacles: ${JSON.stringify(context.facility.obstacles)}\n`;
    }
    if (context.facility.lighting) prompt += `Lighting: ${context.facility.lighting}\n`;
    if (context.facility.weatherConsiderations) {
      prompt += `Weather Considerations: ${context.facility.weatherConsiderations}\n`;
    }
    prompt += `\n**IMPORTANT: Adapt all recommendations to work within these facility constraints.**\n`;
    prompt += '\n';
  }

  // Weather/Environmental context
  if (context.weatherContext || context.environmentalFactors) {
    prompt += `\n**CURRENT CONDITIONS:**\n`;
    if (context.weatherContext) {
      if (context.weatherContext.temperature) {
        prompt += `Temperature: ${context.weatherContext.temperature}°F\n`;
      }
      if (context.weatherContext.wind) prompt += `Wind: ${context.weatherContext.wind}\n`;
      if (context.weatherContext.precipitation) {
        prompt += `Precipitation: ${context.weatherContext.precipitation}\n`;
      }
      if (context.weatherContext.timeOfDay) {
        prompt += `Time of Day: ${context.weatherContext.timeOfDay}\n`;
      }
      if (context.weatherContext.seasonalConsiderations) {
        prompt += `Seasonal: ${context.weatherContext.seasonalConsiderations}\n`;
      }
    }
    if (context.environmentalFactors && context.environmentalFactors.length > 0) {
      prompt += `Environmental Factors: ${context.environmentalFactors.join(', ')}\n`;
    }
    prompt += `\n**IMPORTANT: Adapt session plan based on these conditions.**\n`;
    prompt += '\n';
  }

  return prompt;
}
