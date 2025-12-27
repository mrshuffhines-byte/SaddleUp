import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface OnboardingData {
  experienceLevel: string;
  primaryGoal: string;
  daysPerWeek: number;
  sessionLength: number;
  ownsHorse: boolean;
  horseDetails?: string;
}

export interface TrainingPlanStructure {
  phases: Phase[];
}

export interface Phase {
  phaseNumber: number;
  phaseName: string;
  description: string;
  modules: Module[];
}

export interface Module {
  moduleNumber: number;
  moduleName: string;
  description: string;
  lessons: LessonTemplate[];
}

export interface LessonTemplate {
  lessonNumber: number;
  title: string;
  objective: string;
  equipment: string[];
  instructions: string[];
  safetyNotes: string[];
  commonMistakes: string[];
  moveOnWhen: string[];
  requiresProfessionalHelp?: boolean;
}

export async function generateTrainingPlan(data: OnboardingData): Promise<TrainingPlanStructure> {
  const goalDescriptions: Record<string, string> = {
    learn_to_ride: 'learning to ride',
    learn_to_drive: 'learning to drive a cart behind a horse',
    groundwork_only: 'groundwork and horsemanship skills',
    general_horsemanship: 'general horse care and horsemanship',
  };

  const experienceDescriptions: Record<string, string> = {
    complete_beginner: 'complete beginner with no prior horse experience',
    some_experience: 'someone with some prior experience with horses',
    returning_rider: 'a returning rider who needs to refresh their skills',
    experienced: 'an experienced rider looking to refine their skills',
  };

  const prompt = `You are an expert horse trainer and instructor creating a personalized training curriculum for ${experienceDescriptions[data.experienceLevel]} who wants ${goalDescriptions[data.primaryGoal]}.

The student has ${data.daysPerWeek} day(s) per week available for training, with sessions lasting ${data.sessionLength} minutes each. ${data.ownsHorse ? `They own a horse. ${data.horseDetails ? `Details: ${data.horseDetails}` : ''}` : 'They do not own a horse and will be taking lessons.'}

Create a comprehensive, progressive training plan with the following structure:
- Break the plan into 2-4 phases (Foundation, Building Skills, Refinement, etc.)
- Each phase should contain 2-4 modules
- Each module should contain 3-6 individual lessons
- Lessons must be specific, actionable, and age-appropriate
- Always start with foundational safety and horse behavior basics
- Never skip foundational skills
- Include review/reinforcement sessions regularly
- Flag lessons that require professional instruction (first canter, first time in cart, etc.)
- Acknowledge that training isn't linear and horses have bad days

For each lesson, provide:
1. Clear objective
2. Required equipment
3. Step-by-step instructions (specific, not vague)
4. Safety notes
5. Common mistakes to avoid
6. Criteria for moving on to the next lesson

Return your response as a JSON object with this exact structure:
{
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Foundation",
      "description": "...",
      "modules": [
        {
          "moduleNumber": 1,
          "moduleName": "...",
          "description": "...",
          "lessons": [
            {
              "lessonNumber": 1,
              "title": "...",
              "objective": "...",
              "equipment": ["..."],
              "instructions": ["..."],
              "safetyNotes": ["..."],
              "commonMistakes": ["..."],
              "moveOnWhen": ["..."],
              "requiresProfessionalHelp": false
            }
          ]
        }
      ]
    }
  ]
}

Make sure the JSON is valid and parseable.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from the response (might have markdown code blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    jsonText = jsonText.trim();

    const plan = JSON.parse(jsonText) as TrainingPlanStructure;
    return plan;
  } catch (error) {
    console.error('Error generating training plan:', error);
    throw new Error('Failed to generate training plan');
  }
}
