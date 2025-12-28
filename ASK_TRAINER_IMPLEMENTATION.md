# Ask the Trainer Feature - Implementation Notes

## Database Schema Updates

### New Models Added:
1. **HorsemanshipMethod** - Stores all horsemanship methods with details
2. **UserMethodPreference** - User's preferred method and comparison settings
3. **Conversation** - Chat conversations
4. **Message** - Individual messages in conversations
5. **MediaUpload** - Photo/video uploads
6. **SavedAnswer** - User's saved Q&A pairs

## Backend Implementation

### New API Routes:
- `/api/conversations` - CRUD for conversations
- `/api/messages` - Create messages and get AI responses
- `/api/saved-answers` - Manage saved answers
- `/api/methods` - Get methods and manage user preferences

### Key Features:
1. **Context-Aware AI**: The chat system includes:
   - User's experience level
   - Current training plan and lessons
   - Preferred horsemanship method
   - Conversation history

2. **Method-Specific Responses**: AI frames answers through the selected method's:
   - Philosophy and terminology
   - Specific exercises and games
   - Equipment recommendations
   - Training progression

3. **Media Analysis**: Support for photo/video uploads (storage integration pending)

## Frontend Implementation

### New Screens:
- `(tabs)/chat.tsx` - Main chat interface
- `saved-answers.tsx` - Library of saved answers

### Features:
- Chat interface with message history
- Create new conversations
- Save answers to personal library
- Category filtering for saved answers

## Seeding Horsemanship Methods

Run the seed script to populate methods:
```bash
cd backend
npm run seed:methods
```

Currently includes sample methods from:
- Western Traditions
- Natural Horsemanship
- Classical Dressage
- Positive Reinforcement

**Note**: The seed script includes a sample of methods. You'll want to expand it with all the methods listed in your requirements.

## Pending Implementation

### Media Upload:
1. **Cloud Storage**: Integrate Cloudinary or similar service
2. **Video Processing**: Compression and thumbnail generation
3. **Upload UI**: Camera/video picker in chat interface
4. **Media Analysis**: Enhanced AI prompts for visual analysis

### Enhanced Features:
1. **Method Comparison**: Toggle to see multiple method perspectives
2. **Method Selection in Onboarding**: Add method preference step
3. **Suggested Questions**: Based on current lesson
4. **Video Player**: With timestamp markers for feedback
5. **Method Info Cards**: Detailed method descriptions

### Method Database:
- Currently includes 7 sample methods
- Need to add remaining ~80+ methods from requirements
- Categories include:
  - Western Traditions (6)
  - Classical/Traditional Dressage (5)
  - English Disciplines (6)
  - Natural Horsemanship (20+)
  - Positive Reinforcement (7)
  - Driving-Specific (7)
  - Groundwork Specialists (5)
  - Behavioral/Scientific (5)
  - Therapeutic/Holistic (7)
  - Breed/Discipline Specific (7)
  - Historical/Preservation (6)
  - Wild Horse/Mustang (5)
  - Young Horse/Starting (5)

## Usage Flow

1. User opens "Ask Trainer" tab
2. Creates new conversation or selects existing
3. Asks question (optionally with media)
4. AI responds with method-specific, context-aware answer
5. User can save helpful answers
6. Saved answers organized by category in library

## Next Steps

1. Expand method database with all methods
2. Integrate media upload storage (Cloudinary)
3. Add method selection to onboarding
4. Implement method comparison toggle
5. Add video analysis with timestamp markers
6. Create method info/education screens
7. Add suggested questions based on current lesson

