// Reusable seed methods function
import { prisma } from './prisma';

export const methods = [
  // ========== WESTERN TRADITIONS ==========
  {
    name: 'Traditional Western',
    category: 'Western Traditions',
    description: 'Working ranch heritage, practical cattle work, stock seat equitation',
    philosophy: 'Practical, working ranch horsemanship focused on cattle work and ranch tasks',
    bestFor: 'Ranch work, cattle handling, practical horsemanship',
    keyPrinciples: ['Stock seat position', 'Direct rein', 'Practical applications', 'Working cattle'],
    commonTerminology: {
      'Stock seat': 'Deep seat used for working cattle',
      'Direct rein': 'Rein applied directly to turn the horse',
    },
    typicalEquipment: ['Western saddle', 'Split reins', 'Curb bit', 'Bridle'],
  },
  {
    name: 'Vaquero/Californio',
    category: 'Western Traditions',
    founder: 'Spanish/Mexican vaquero tradition',
    description: 'Spanish influence, hackamore to spade bit progression, emphasis on refinement and lightness',
    philosophy: 'Progressive refinement from hackamore to spade bit, emphasis on lightness and collection',
    bestFor: 'Advanced riders seeking refinement, working cow horses',
    keyPrinciples: ['Two-rein system', 'Bosal to spade progression', 'Lightness', 'Collection'],
    commonTerminology: {
      'Bosal': 'Rawhide noseband used in first stage',
      'Two-rein': 'Using both bosal and bridle simultaneously',
      'Spade bit': 'Refined bit for finished horses',
    },
    typicalEquipment: ['Bosal hackamore', 'Spade bit', 'Romal reins', 'Vaquero saddle'],
  },
  {
    name: 'Texas Cowboy',
    category: 'Western Traditions',
    description: 'Faster training methods, direct rein, working ranch focus',
    philosophy: 'Practical, efficient training for working ranch environments',
    bestFor: 'Working ranch applications, time-efficient training',
    keyPrinciples: ['Direct rein', 'Practical efficiency', 'Working cattle', 'Ranch tasks'],
    typicalEquipment: ['Western saddle', 'Split reins', 'Curb bit'],
  },
  {
    name: 'Reining',
    category: 'Western Traditions',
    description: 'Precision maneuvers, sliding stops, spins, lead changes',
    philosophy: 'Precision performance of specific patterns and maneuvers',
    bestFor: 'Competition reining, precision riding',
    keyPrinciples: ['Sliding stops', 'Spins', 'Lead changes', 'Pattern precision'],
    typicalEquipment: ['Reining saddle', 'Reins', 'Bit'],
  },
  {
    name: 'Cutting',
    category: 'Western Traditions',
    description: 'Cow work, reading cattle, independent horse movement',
    philosophy: 'Horse works independently to separate cattle from herd',
    bestFor: 'Cattle work, cutting competitions',
    keyPrinciples: ['Reading cattle', 'Independent movement', 'Balance', 'Quick response'],
    typicalEquipment: ['Cutting saddle', 'Split reins'],
  },
  {
    name: 'Ranch Versatility',
    category: 'Western Traditions',
    description: 'All-around ranch skills, trail obstacles, cattle work, roping',
    philosophy: 'Well-rounded ranch horse capable of multiple tasks',
    bestFor: 'All-around ranch work, versatility competitions',
    keyPrinciples: ['Versatility', 'Trail obstacles', 'Cattle work', 'Roping'],
    typicalEquipment: ['Ranch saddle', 'Ropes', 'Various equipment'],
  },

  // ========== CLASSICAL/TRADITIONAL DRESSAGE ==========
  {
    name: 'Classical Dressage',
    category: 'Classical/Traditional Dressage',
    description: 'French/German tradition, training scale, collection through engagement',
    philosophy: 'Systematic development through the training scale, emphasis on balance, rhythm, and collection',
    bestFor: 'Developing balanced, collected movement, foundation for all riding',
    keyPrinciples: ['Training scale', 'Throughness', 'Collection', 'Impulsion'],
    commonTerminology: {
      'Training scale': 'Rhythm, Suppleness, Contact, Impulsion, Straightness, Collection',
      'Throughness': 'Horse accepting aids without resistance',
      'Collection': 'Shortening stride while maintaining energy',
    },
    typicalEquipment: ['Dressage saddle', 'Double bridle', 'Snaffle bit', 'Dressage whip'],
  },
  {
    name: 'Portuguese/Iberian',
    category: 'Classical/Traditional Dressage',
    description: 'Haute école, working equitation, garrocha',
    philosophy: 'Iberian tradition emphasizing collection, lateral work, and working equitation',
    bestFor: 'Iberian breeds, working equitation, classical collection',
    keyPrinciples: ['Haute école', 'Garrocha work', 'Working equitation', 'Collection'],
    typicalEquipment: ['Iberian saddle', 'Portuguese bridle', 'Garrocha'],
  },
  {
    name: 'Viennese (Spanish Riding School)',
    category: 'Classical/Traditional Dressage',
    description: 'Lipizzan traditions, airs above ground, highest classical work',
    philosophy: 'Preservation of classical riding traditions, highest level of dressage',
    bestFor: 'Classical dressage, airs above ground, preservation of tradition',
    keyPrinciples: ['Airs above ground', 'Classical tradition', 'Lipizzan training', 'Highest collection'],
    typicalEquipment: ['Classical saddle', 'Double bridle', 'Training equipment'],
  },
  {
    name: 'French Classical (Baucherism)',
    category: 'Classical/Traditional Dressage',
    founder: 'François Baucher',
    description: 'Légèreté, flexions, academic equitation',
    philosophy: 'Lightness through systematic flexions and academic approach',
    bestFor: 'Achieving lightness, academic dressage approach',
    keyPrinciples: ['Légèreté', 'Flexions', 'Academic approach', 'Lightness'],
    typicalEquipment: ['Classical saddle', 'Snaffle', 'Double bridle'],
  },
  {
    name: 'Academic Art of Riding',
    category: 'Classical/Traditional Dressage',
    founder: 'Bent Branderup',
    description: 'Historical classical riding, groundwork integration',
    philosophy: 'Revival of historical classical riding methods with modern understanding',
    bestFor: 'Historical classical riding, groundwork integration',
    keyPrinciples: ['Historical methods', 'Groundwork', 'Classical principles', 'Systematic progression'],
    typicalEquipment: ['Classical saddle', 'Historical equipment', 'Groundwork tools'],
  },

  // ========== NATURAL HORSEMANSHIP METHODS ==========
  {
    name: 'Pat Parelli (Parelli Natural Horsemanship)',
    category: 'Natural Horsemanship Methods',
    founder: 'Pat Parelli',
    description: 'Seven games, levels program, savvy system, liberty and freestyle',
    philosophy: 'Partnership through understanding horse psychology, using the Seven Games as foundation',
    bestFor: 'Building partnership, understanding horse psychology, liberty work',
    keyPrinciples: ['Seven Games', 'Four Phases', 'Ask, Tell, Promise', 'Liberty and Freestyle'],
    commonTerminology: {
      'Seven Games': 'Friendly, Porcupine, Driving, Yo-yo, Circling, Sideways, Squeeze',
      'Savvy': 'Understanding and skill',
      'Levels': 'Progressive skill development (1-4)',
    },
    typicalEquipment: ['Carrot stick', '12-foot line', '22-foot line', 'Hackamore', 'Natural hackamore'],
  },
  {
    name: 'Clinton Anderson (Downunder Horsemanship)',
    category: 'Natural Horsemanship Methods',
    founder: 'Clinton Anderson',
    description: 'Fundamentals series, gaining respect, desensitizing, Method Ambassador program',
    philosophy: 'Building respect through groundwork, systematic desensitization, clear boundaries',
    bestFor: 'Problem horses, establishing respect, systematic training',
    keyPrinciples: ['Fundamentals', 'Gaining respect', 'Desensitizing', 'Methodical progression'],
    commonTerminology: {
      'Fundamentals': 'Foundation exercises for respect',
      'Ambassador': 'Method Ambassador program progression',
    },
    typicalEquipment: ['Horsemanship rope', 'Training stick', 'Flag', 'Hackamore'],
  },
  {
    name: 'Chris Cox',
    category: 'Natural Horsemanship Methods',
    founder: 'Chris Cox',
    description: 'Balanced approach, ranch work foundation, cow horse training',
    philosophy: 'Balanced training approach combining natural horsemanship with practical ranch applications',
    bestFor: 'Ranch horses, balanced training, cow horse development',
    keyPrinciples: ['Balance', 'Ranch foundation', 'Cow horse training', 'Practical application'],
    typicalEquipment: ['Western saddle', 'Hackamore', 'Training equipment'],
  },
  {
    name: 'Buck Brannaman',
    category: 'Natural Horsemanship Methods',
    founder: 'Buck Brannaman',
    description: 'Ray Hunt lineage, feel and timing, soft feel, working ranch influence',
    philosophy: 'Feel, timing, and soft feel through understanding horse behavior and communication',
    bestFor: 'Developing feel and timing, soft feel, working ranch applications',
    keyPrinciples: ['Feel and timing', 'Soft feel', 'Horse perspective', 'Working ranch'],
    typicalEquipment: ['Working gear', 'Hackamore', 'Bits'],
  },
  {
    name: 'Ray Hunt',
    category: 'Natural Horsemanship Methods',
    founder: 'Ray Hunt',
    description: 'True unity, feel over mechanics, horse\'s perspective',
    philosophy: 'True unity between horse and rider through feel, not force',
    bestFor: 'Developing feel, understanding horse perspective, unity',
    keyPrinciples: ['True unity', 'Feel over mechanics', 'Horse perspective', 'Communication'],
    typicalEquipment: ['Natural equipment', 'Varied'],
  },
  {
    name: 'Tom Dorrance',
    category: 'Natural Horsemanship Methods',
    founder: 'Tom Dorrance',
    description: 'Foundation of natural horsemanship, listening to the horse, balance',
    philosophy: 'Foundation principles of natural horsemanship, true listening and balance',
    bestFor: 'Understanding fundamentals, balance, true communication',
    keyPrinciples: ['Foundation principles', 'Listening', 'Balance', 'True unity'],
    typicalEquipment: ['Minimal equipment', 'Natural approach'],
  },
  {
    name: 'Warwick Schiller (Attuned Horsemanship)',
    category: 'Natural Horsemanship Methods',
    founder: 'Warwick Schiller',
    description: 'Principles-based, nervous system focus, relaxation before training',
    philosophy: 'Address nervous system state before training, focus on relaxation and understanding the horse\'s perspective',
    bestFor: 'Anxious horses, understanding horse psychology, relationship building',
    keyPrinciples: ['Nervous system regulation', 'Relaxation first', 'Understanding the horse', 'Principles-based'],
    commonTerminology: {
      'Attuned': 'Being aware and responsive to the horse\'s state',
      'Nervous system': 'Focus on regulating horse\'s stress response',
    },
    typicalEquipment: ['Varied', 'Emphasis on feel over equipment'],
  },
  {
    name: 'Mark Rashid',
    category: 'Natural Horsemanship Methods',
    founder: 'Mark Rashid',
    description: 'Passive leadership, aikido principles, soft feel',
    philosophy: 'Passive leadership using aikido principles for soft feel and communication',
    bestFor: 'Soft feel, passive leadership, aikido-based approach',
    keyPrinciples: ['Passive leadership', 'Aikido principles', 'Soft feel', 'Harmony'],
    typicalEquipment: ['Natural equipment'],
  },
  {
    name: 'Monty Roberts (Join-Up)',
    category: 'Natural Horsemanship Methods',
    founder: 'Monty Roberts',
    description: 'Join-up technique, Equus language, advance-retreat, mustang gentling',
    philosophy: 'Communication through Equus language, join-up method for gentling',
    bestFor: 'Mustang gentling, join-up technique, Equus communication',
    keyPrinciples: ['Join-up', 'Equus language', 'Advance-retreat', 'Gentling'],
    typicalEquipment: ['Round pen', 'Minimal equipment'],
  },
  {
    name: 'John Lyons (Conditioned Response)',
    category: 'Natural Horsemanship Methods',
    founder: 'John Lyons',
    description: 'Cue-response training, step-by-step conditioning, round pen work',
    philosophy: 'Systematic cue-response training through step-by-step conditioning',
    bestFor: 'Systematic training, cue-response development, conditioning',
    keyPrinciples: ['Cue-response', 'Step-by-step', 'Conditioning', 'Round pen'],
    typicalEquipment: ['Round pen', 'Training equipment'],
  },
  {
    name: 'Ken McNabb',
    category: 'Natural Horsemanship Methods',
    founder: 'Ken McNabb',
    description: 'Diamond Training System, ranch-based, family-friendly approach',
    philosophy: 'Family-friendly ranch-based training system',
    bestFor: 'Family applications, ranch horses, systematic approach',
    keyPrinciples: ['Diamond System', 'Ranch-based', 'Family-friendly', 'Systematic'],
    typicalEquipment: ['Ranch equipment'],
  },
  {
    name: 'Josh Lyons',
    category: 'Natural Horsemanship Methods',
    founder: 'Josh Lyons',
    description: 'Continued John Lyons method, performance focus',
    philosophy: 'Continuation of John Lyons method with performance emphasis',
    bestFor: 'Performance horses, systematic training',
    keyPrinciples: ['Performance focus', 'Systematic training', 'Conditioning'],
    typicalEquipment: ['Training equipment'],
  },

  // ========== POSITIVE REINFORCEMENT/CLICKER TRAINING ==========
  {
    name: 'Alexandra Kurland (The Click That Teaches)',
    category: 'Positive Reinforcement/Clicker Training',
    founder: 'Alexandra Kurland',
    description: 'Foundation of equine clicker training, systematic approach',
    philosophy: 'Positive reinforcement through clicker training, systematic shaping of behaviors',
    bestFor: 'Force-free training, building confidence, systematic behavior shaping',
    keyPrinciples: ['Clicker training', 'Positive reinforcement', 'Shaping', 'Target training'],
    commonTerminology: {
      'Click': 'Marker signal for correct behavior',
      'Shaping': 'Breaking down behaviors into small steps',
    },
    typicalEquipment: ['Clicker', 'Treats', 'Targets'],
  },
  {
    name: 'Shawna Karrasch (On Target Training)',
    category: 'Positive Reinforcement/Clicker Training',
    founder: 'Shawna Karrasch',
    description: 'Marine mammal training applied to horses, targeting',
    philosophy: 'Applying marine mammal training principles to horses through targeting',
    bestFor: 'Target training, behavior modification, positive reinforcement',
    keyPrinciples: ['Targeting', 'Positive reinforcement', 'Marine mammal principles'],
    typicalEquipment: ['Clicker', 'Targets', 'Treats'],
  },
  {
    name: 'Hannah Weston (Connection Training)',
    category: 'Positive Reinforcement/Clicker Training',
    founder: 'Hannah Weston',
    description: 'R+ with traditional riding integration',
    philosophy: 'Positive reinforcement integrated with traditional riding',
    bestFor: 'Combining R+ with riding, balanced approach',
    keyPrinciples: ['Positive reinforcement', 'Riding integration', 'Connection'],
    typicalEquipment: ['Clicker', 'Riding equipment', 'Treats'],
  },

  // ========== DRIVING-SPECIFIC METHODS ==========
  {
    name: 'Traditional Carriage Driving (CAA)',
    category: 'Driving-Specific Methods',
    description: 'Combined driving, pleasure driving, formal traditions',
    philosophy: 'Formal carriage driving traditions and competition',
    bestFor: 'Carriage driving, combined driving events, formal driving',
    keyPrinciples: ['Formal tradition', 'Combined driving', 'Pleasure driving', 'Presentation'],
    typicalEquipment: ['Carriage', 'Harness', 'Whip'],
  },
  {
    name: 'Working Teamster',
    category: 'Driving-Specific Methods',
    description: 'Draft horse handling, farm work, logging',
    philosophy: 'Practical draft horse handling for farm and logging work',
    bestFor: 'Draft horses, farm work, logging, practical applications',
    keyPrinciples: ['Draft handling', 'Farm work', 'Logging', 'Practical skills'],
    typicalEquipment: ['Draft harness', 'Work equipment', 'Carts'],
  },
  {
    name: 'Doc Hammill (Horsemanship for Teamsters)',
    category: 'Driving-Specific Methods',
    founder: 'Doc Hammill',
    description: 'Draft horse handling, safety-first approach',
    philosophy: 'Safety-first approach to draft horse handling and teamster work',
    bestFor: 'Draft horses, safety-focused training, teamster work',
    keyPrinciples: ['Safety first', 'Draft handling', 'Teamster skills', 'Practical work'],
    typicalEquipment: ['Draft equipment', 'Safety gear'],
  },

  // ========== GROUNDWORK SPECIALISTS ==========
  {
    name: 'TTEAM (Linda Tellington-Jones)',
    category: 'Groundwork Specialists',
    founder: 'Linda Tellington-Jones',
    description: 'Tellington Touch, ground exercises, labyrinth, body work integration',
    philosophy: 'Tellington Touch and body work integrated with ground exercises',
    bestFor: 'Body awareness, groundwork, TTouch integration',
    keyPrinciples: ['TTouch', 'Ground exercises', 'Labyrinth', 'Body work'],
    typicalEquipment: ['TTouch tools', 'Ground equipment', 'Labyrinth'],
  },
  {
    name: 'Equine Agility',
    category: 'Groundwork Specialists',
    description: 'Obstacle work, liberty, confidence building',
    philosophy: 'Building confidence through obstacle work and liberty exercises',
    bestFor: 'Confidence building, obstacle work, liberty training',
    keyPrinciples: ['Obstacles', 'Liberty', 'Confidence', 'Groundwork'],
    typicalEquipment: ['Obstacles', 'Ground equipment'],
  },

  // ========== BEHAVIORAL/SCIENTIFIC APPROACH ==========
  {
    name: 'Applied Behavior Analysis',
    category: 'Behavioral/Scientific Approach',
    description: 'Scientific behavior modification, measurable outcomes',
    philosophy: 'Scientific approach to behavior modification with measurable results',
    bestFor: 'Behavior modification, scientific approach, measurable training',
    keyPrinciples: ['Scientific method', 'Behavior modification', 'Measurable outcomes', 'Data-driven'],
    typicalEquipment: ['Varied', 'Scientific tools'],
  },
  {
    name: 'Equitation Science (Andrew McLean)',
    category: 'Behavioral/Scientific Approach',
    founder: 'Andrew McLean',
    description: 'Learning theory applied to training, negative reinforcement ethics',
    philosophy: 'Applying learning theory to horse training with ethical considerations',
    bestFor: 'Scientific training approach, learning theory application',
    keyPrinciples: ['Learning theory', 'Scientific approach', 'Ethical training', 'Systematic'],
    typicalEquipment: ['Standard equipment'],
  },
];

export async function seedMethods() {
  console.log('Seeding horsemanship methods...');
  let seeded = 0;
  let updated = 0;

  for (const method of methods) {
    try {
      const existing = await prisma.horsemanshipMethod.findUnique({
        where: { name: method.name },
      });

      if (existing) {
        await prisma.horsemanshipMethod.update({
          where: { name: method.name },
          data: method,
        });
        updated++;
        console.log(`✓ Updated: ${method.name}`);
      } else {
        await prisma.horsemanshipMethod.create({
          data: method,
        });
        seeded++;
        console.log(`✓ Seeded: ${method.name}`);
      }
    } catch (error: any) {
      console.error(`✗ Failed to seed ${method.name}:`, error.message);
    }
  }

  const total = await prisma.horsemanshipMethod.count();
  console.log(`\nDone! Seeded ${seeded} new methods, updated ${updated} existing methods. Total: ${total} methods.`);
  
  return { seeded, updated, total };
}

