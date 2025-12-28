// Fallback training plan generator when AI generation fails
import { TrainingPlanStructure, OnboardingData } from './claude';

export function generateFallbackPlan(data: OnboardingData): TrainingPlanStructure {
  const goalDescriptions: Record<string, string> = {
    learn_to_ride: 'learning to ride',
    learn_to_drive: 'learning to drive a cart behind a horse',
    groundwork_only: 'groundwork and horsemanship skills',
    general_horsemanship: 'general horse care and horsemanship',
  };

  const goal = goalDescriptions[data.primaryGoal] || 'groundwork and horsemanship skills';
  const isBeginner = data.experienceLevel === 'complete_beginner' || data.experienceLevel === 'some_experience';

  // Generate a basic 6-week groundwork plan
  const plan: TrainingPlanStructure = {
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Foundation & Safety',
        description: `Building essential groundwork skills and safety awareness for ${goal}.`,
        modules: [
          {
            moduleNumber: 1,
            moduleName: 'Safety Basics',
            description: 'Essential safety practices and horse behavior understanding.',
            lessons: [
              {
                lessonNumber: 1,
                title: 'Understanding Horse Body Language',
                objective: 'Learn to read basic horse signals and understand when a horse is relaxed, alert, or stressed.',
                equipment: ['Notebook', 'Safe observation area'],
                instructions: [
                  'Observe horses from a safe distance (at least 10 feet away)',
                  'Watch for ear position (forward = alert/curious, pinned back = upset)',
                  'Notice tail position (swishing = irritation, relaxed = calm)',
                  'Observe head height (high = alert/stressed, low = relaxed)',
                  'Watch for signs of relaxation: lowered head, soft eyes, relaxed stance',
                  'Practice identifying at least 3 different emotional states',
                ],
                safetyNotes: [
                  'Always maintain safe distance when observing unfamiliar horses',
                  'Never approach a horse from directly behind',
                  'Watch for warning signs: pinned ears, swishing tail, raised head',
                ],
                commonMistakes: [
                  'Getting too close too quickly',
                  'Misreading friendly curiosity as aggression',
                  'Ignoring subtle warning signs',
                ],
                moveOnWhen: [
                  'You can identify at least 5 different body language signals',
                  'You feel confident recognizing relaxed vs. stressed states',
                ],
                requiresProfessionalHelp: false,
              },
              {
                lessonNumber: 2,
                title: 'Approaching and Greeting a Horse Safely',
                objective: 'Learn the correct way to approach and greet a horse to build trust and ensure safety.',
                equipment: ['Halter', 'Lead rope', 'Treats (optional)'],
                instructions: [
                  'Approach from the side, never directly from front or behind',
                  'Speak softly as you approach to let the horse know you\'re there',
                  'Approach at a slight angle, stopping about 3-4 feet away',
                  'Extend your hand slowly, palm down, fingers together',
                  'Let the horse sniff your hand before attempting to touch',
                  'If the horse steps away, pause and wait for them to return',
                  'Once accepted, gently stroke the neck or shoulder',
                ],
                safetyNotes: [
                  'Always approach from the side, never directly in front',
                  'Keep your hand flat, fingers together (never make a fist)',
                  'Watch the horse\'s ears and body language',
                  'If the horse pins ears or shows stress, back away slowly',
                ],
                commonMistakes: [
                  'Approaching too quickly or directly',
                  'Making sudden movements',
                  'Reaching for the head before the horse is ready',
                ],
                moveOnWhen: [
                  'You can approach and greet a horse calmly',
                  'The horse accepts your approach without stress signals',
                ],
                requiresProfessionalHelp: false,
              },
              {
                lessonNumber: 3,
                title: 'Personal Space and Boundaries',
                objective: 'Establish respectful boundaries and understand the horse\'s personal space bubble.',
                equipment: ['Lead rope', 'Safe enclosed area'],
                instructions: [
                  'Stand at a comfortable distance (about 3-4 feet) from the horse',
                  'Practice moving closer and further away, observing the horse\'s response',
                  'Learn to recognize when a horse is comfortable vs. uncomfortable with your proximity',
                  'Practice asking the horse to step back by using body language (not force)',
                  'Respect when the horse needs more space',
                ],
                safetyNotes: [
                  'Always respect a horse\'s need for space',
                  'Never corner a horse or block escape routes',
                  'Watch for signs of discomfort: pinned ears, shifting weight away',
                ],
                commonMistakes: [
                  'Invading the horse\'s space too quickly',
                  'Ignoring the horse\'s signals for more space',
                  'Cornering or trapping the horse',
                ],
                moveOnWhen: [
                  'You can read when a horse needs more space',
                  'You can respectfully ask a horse to step back using body language',
                ],
                requiresProfessionalHelp: false,
              },
            ],
          },
          {
            moduleNumber: 2,
            moduleName: 'Basic Handling',
            description: 'Fundamental skills for safely handling horses on the ground.',
            lessons: [
              {
                lessonNumber: 1,
                title: 'Putting on a Halter',
                objective: 'Learn to safely put a halter on a horse.',
                equipment: ['Halter', 'Lead rope'],
                instructions: [
                  'Approach the horse calmly from the side',
                  'Hold the halter in your left hand, unbuckled',
                  'Place your right arm over the horse\'s neck',
                  'Gently guide the noseband over the nose',
                  'Bring the crown piece over the ears',
                  'Fasten the buckle securely but not too tight',
                  'Check that the halter fits properly (two fingers should fit between halter and face)',
                ],
                safetyNotes: [
                  'Never stand directly in front of the horse',
                  'Keep your body to the side',
                  'If the horse moves away, don\'t force it - pause and try again',
                ],
                commonMistakes: [
                  'Putting the halter on backwards',
                  'Making it too tight or too loose',
                  'Rushing the process',
                ],
                moveOnWhen: [
                  'You can put a halter on calmly and correctly',
                  'The horse accepts the halter without stress',
                ],
                requiresProfessionalHelp: false,
              },
              {
                lessonNumber: 2,
                title: 'Leading Basics',
                objective: 'Learn to lead a horse safely and respectfully.',
                equipment: ['Halter', 'Lead rope'],
                instructions: [
                  'Hold the lead rope in your right hand, about 12-18 inches from the halter',
                  'Keep the excess rope coiled in your left hand (never wrap around your hand)',
                  'Walk beside the horse\'s shoulder, not in front or behind',
                  'Use gentle pressure and release to ask the horse to move',
                  'Stop and wait if the horse stops',
                  'Practice walking, stopping, and turning',
                ],
                safetyNotes: [
                  'Never wrap the lead rope around your hand, wrist, or body',
                  'Stay beside the horse\'s shoulder, not directly in front',
                  'Watch where you\'re walking to avoid tripping',
                ],
                commonMistakes: [
                  'Pulling or dragging the horse',
                  'Walking too far ahead or behind',
                  'Wrapping the rope around your hand',
                ],
                moveOnWhen: [
                  'You can lead the horse forward, stop, and turn smoothly',
                  'The horse follows willingly without constant pulling',
                ],
                requiresProfessionalHelp: false,
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Building Connection',
        description: 'Developing trust and communication with your horse.',
        modules: [
          {
            moduleNumber: 1,
            moduleName: 'Groundwork Exercises',
            description: 'Basic groundwork exercises to build communication and respect.',
            lessons: [
              {
                lessonNumber: 1,
                title: 'Backing Up',
                objective: 'Teach the horse to back up on command, establishing respect for your space.',
                equipment: ['Halter', 'Lead rope'],
                instructions: [
                  'Stand facing the horse, about 3-4 feet away',
                  'Hold the lead rope with gentle contact',
                  'Apply gentle backward pressure on the lead rope',
                  'As soon as the horse takes even one step back, release the pressure immediately',
                  'Repeat, asking for one step at a time',
                  'Gradually build up to asking for 2-3 steps back',
                ],
                safetyNotes: [
                  'Never pull hard or jerk the rope',
                  'Release pressure immediately when the horse responds',
                  'Stay aware of your position - don\'t get too close',
                ],
                commonMistakes: [
                  'Pulling too hard or continuously',
                  'Not releasing pressure when the horse responds',
                  'Getting frustrated and forcing the movement',
                ],
                moveOnWhen: [
                  'The horse backs up willingly with light pressure',
                  'You can ask for 2-3 steps back consistently',
                ],
                requiresProfessionalHelp: false,
              },
              {
                lessonNumber: 2,
                title: 'Moving the Hindquarters',
                objective: 'Learn to move the horse\'s hindquarters, establishing control and respect.',
                equipment: ['Halter', 'Lead rope'],
                instructions: [
                  'Stand beside the horse\'s shoulder, facing the hindquarters',
                  'Apply gentle pressure to the horse\'s side with your hand or a training stick',
                  'As soon as the horse moves the hindquarters away, release the pressure',
                  'Practice moving both hindquarters left and right',
                  'Keep the horse\'s front feet relatively still while moving the hindquarters',
                ],
                safetyNotes: [
                  'Stay to the side, never directly behind the horse',
                  'Use gentle pressure, not force',
                  'Watch the horse\'s body language for signs of stress',
                ],
                commonMistakes: [
                  'Using too much pressure',
                  'Standing in an unsafe position',
                  'Not releasing pressure when the horse responds',
                ],
                moveOnWhen: [
                  'You can move the hindquarters left and right with light pressure',
                  'The horse responds willingly without stress',
                ],
                requiresProfessionalHelp: false,
              },
            ],
          },
        ],
      },
    ],
  };

  // Add more phases based on goal
  if (data.primaryGoal === 'learn_to_ride' && !isBeginner) {
    plan.phases.push({
      phaseNumber: 3,
      phaseName: 'Preparation for Riding',
      description: 'Preparing for your first mounted experiences.',
      modules: [
        {
          moduleNumber: 1,
          moduleName: 'Pre-Riding Skills',
          description: 'Essential skills before getting in the saddle.',
          lessons: [
            {
              lessonNumber: 1,
              title: 'Introduction to Tack',
              objective: 'Learn about basic riding equipment and how to handle it safely.',
              equipment: ['Saddle pad', 'Saddle', 'Bridle', 'Girth'],
              instructions: [
                'Observe and handle each piece of equipment',
                'Learn the names and purposes of each item',
                'Practice placing a saddle pad on a horse (with supervision)',
                'Learn to check equipment for safety (straps, buckles, etc.)',
              ],
              safetyNotes: [
                'Always check equipment before use',
                'Never leave equipment unattended where a horse could get tangled',
                'Work with an experienced person when first handling tack',
              ],
              commonMistakes: [
                'Not checking equipment for damage',
                'Placing equipment incorrectly',
              ],
              moveOnWhen: [
                'You can identify all basic tack pieces',
                'You understand basic safety checks',
              ],
              requiresProfessionalHelp: true,
            },
          ],
        },
      ],
    });
  }

  return plan;
}

