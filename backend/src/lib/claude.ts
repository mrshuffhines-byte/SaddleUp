import { callPerplexityWithPrompt } from './perplexity';

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
    // Use a prompt that instructs Perplexity to return JSON
    const jsonPrompt = `${prompt}\n\nPlease respond with ONLY valid JSON, no additional text or markdown formatting.`;
      
    const responseText = await callPerplexityWithPrompt(
      'You are an expert horse training plan generator. Always respond with valid JSON only.',
      jsonPrompt,
      'sonar-pro'
    );

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    cleanedResponse = cleanedResponse.trim();

    try {
      const plan = JSON.parse(cleanedResponse) as TrainingPlanStructure;
      
      // Validate the structure
      if (!plan.phases || !Array.isArray(plan.phases) || plan.phases.length === 0) {
        console.error('Invalid plan structure: missing phases', plan);
        throw new Error('Invalid training plan structure: no phases found');
      }
      
      return plan;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text (first 500 chars):', cleanedResponse.substring(0, 500));
      throw new Error(`Failed to parse training plan JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating training plan:', error);
    if (error instanceof Error && error.message.includes('parse')) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse training plan JSON: ${error.message}`);
    }
    throw new Error(`Failed to generate training plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
