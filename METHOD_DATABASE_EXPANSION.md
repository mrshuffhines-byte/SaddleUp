# Horsemanship Methods Database Expansion

## Overview

The seed script has been expanded to include a comprehensive database of horsemanship methods across multiple categories. This provides users with a wide range of training approaches to choose from.

## Categories Included

### Western Traditions (6 methods)
- Traditional Western
- Vaquero/Californio
- Texas Cowboy
- Reining
- Cutting
- Ranch Versatility

### Classical/Traditional Dressage (5 methods)
- Classical Dressage
- Portuguese/Iberian
- Viennese (Spanish Riding School)
- French Classical (Baucherism)
- Academic Art of Riding

### Natural Horsemanship Methods (12 methods)
- Pat Parelli (Parelli Natural Horsemanship)
- Clinton Anderson (Downunder Horsemanship)
- Chris Cox
- Buck Brannaman
- Ray Hunt
- Tom Dorrance
- Warwick Schiller (Attuned Horsemanship)
- Mark Rashid
- Monty Roberts (Join-Up)
- John Lyons (Conditioned Response)
- Ken McNabb
- Josh Lyons

### Positive Reinforcement/Clicker Training (3 methods)
- Alexandra Kurland (The Click That Teaches)
- Shawna Karrasch (On Target Training)
- Hannah Weston (Connection Training)

### Driving-Specific Methods (3 methods)
- Traditional Carriage Driving (CAA)
- Working Teamster
- Doc Hammill (Horsemanship for Teamsters)

### Groundwork Specialists (2 methods)
- TTEAM (Linda Tellington-Jones)
- Equine Agility

### Behavioral/Scientific Approach (2 methods)
- Applied Behavior Analysis
- Equitation Science (Andrew McLean)

## Total Methods: 33

## Method Data Structure

Each method includes:
- **name**: Method name
- **category**: Category classification
- **founder**: Founder name (when applicable)
- **description**: Brief description
- **philosophy**: Core philosophy of the method
- **bestFor**: Who/what this method is best suited for
- **keyPrinciples**: Array of key principles
- **commonTerminology**: Object with term definitions (when applicable)
- **typicalEquipment**: Array of equipment commonly used

## Seeding the Database

Run the seed script after setting up your database:

```bash
cd backend
npm run seed:methods
```

This will:
1. Create all methods if they don't exist
2. Update existing methods with new data
3. Display progress for each method seeded
4. Show total count when complete

## Future Expansion

The seed script can be easily expanded with additional methods. Categories that could be added include:

### Additional Categories Available
- English Disciplines (Hunt Seat, Show Jumping, Eventing, etc.)
- Therapeutic/Holistic (Centered Riding, Connected Riding, etc.)
- Breed/Discipline Specific (Icelandic Tölt, Paso Fino, etc.)
- Historical/Preservation (Xenophon, Newcastle, Baucher, etc.)
- Wild Horse/Mustang Specialty
- Young Horse/Starting

### Adding New Methods

To add a new method, simply add an object to the `methods` array in `seed-methods.ts`:

```typescript
{
  name: 'Method Name',
  category: 'Category Name',
  founder: 'Founder Name', // optional
  description: 'Brief description',
  philosophy: 'Core philosophy',
  bestFor: 'Best applications',
  keyPrinciples: ['Principle 1', 'Principle 2'],
  commonTerminology: { // optional
    'Term': 'Definition',
  },
  typicalEquipment: ['Equipment 1', 'Equipment 2'],
}
```

## Usage in Application

Methods are used throughout the application:
- **Onboarding**: Users select preferred method
- **Chat Interface**: AI responses framed through selected method
- **Method Comparison**: Compare approaches when toggle enabled
- **Saved Answers**: Answers tagged with method context
- **Training Plans**: Can influence plan generation (future enhancement)

## Notes

- Methods are stored in `HorsemanshipMethod` table
- Each method has a unique name (used for upsert)
- Categories help organize methods in UI
- Founder field optional but helpful for attribution
- Terminology and principles help AI understand method context

