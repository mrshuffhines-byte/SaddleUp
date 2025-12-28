# Method Features Implementation

## Overview

This implementation adds horsemanship method selection, comparison features, and suggested questions to enhance the Ask the Trainer experience.

## Features Implemented

### 1. Method Selection in Onboarding

**Location:** `frontend/app/onboarding.tsx`

**Features:**
- New step (Step 4 of 5) for method selection
- Methods grouped by category for easy browsing
- Visual selection with highlighted chosen method
- Method descriptions displayed for each option
- "No preference / Still exploring" option available
- Method preference saved to backend when onboarding completes

**UI Elements:**
- Scrollable list of methods organized by category
- Category headers (Western Traditions, Natural Horsemanship, etc.)
- Selected method highlighted with border and background color
- Method name and description displayed

**Data Flow:**
1. User completes onboarding steps 1-3
2. Step 4: User browses and selects preferred method
3. Method preference saved via `/api/methods/preference` endpoint
4. Training plan generation uses method preference for context

### 2. Method Comparison Toggle

**Location:** 
- Frontend: `frontend/app/(tabs)/chat.tsx`
- Backend: `backend/src/lib/chat.ts`

**Features:**
- Toggle switch in chat interface to enable/disable comparisons
- When enabled, AI provides perspective from user's method first, then compares with 1-2 other approaches
- Toggle state saved to user preferences
- Visible in empty state and during conversations

**How It Works:**
- User can toggle "Compare methods" switch
- Preference saved to `UserMethodPreference.showComparisons`
- When enabled, AI prompt instructs Claude to:
  - Provide answer from user's selected method first
  - Then compare with 1-2 other common approaches
  - Highlight similarities and differences
  - Explain how different methods approach the same question

**Example Response (Comparisons Enabled):**
```
[Primary Method - Parelli] In Parelli, this is Game #4 - the Driving Game...

[Comparison - Classical Dressage] In classical work, we develop the turn on the forehand through subtle weight and leg aids...

[Comparison - Clicker Training] We'll shape this using targeting and positive reinforcement...
```

### 3. Suggested Questions

**Location:**
- Frontend: `frontend/components/SuggestedQuestions.tsx`, `frontend/app/(tabs)/chat.tsx`
- Backend: `backend/src/routes/training.ts`

**Features:**
- Questions automatically generated based on user's current lesson
- Displayed in chat interface above message list
- Click to insert question into input field
- Questions focus on:
  - Preparation for current lesson
  - Common mistakes to avoid
  - Equipment needs
  - Safety concerns
  - Criteria for moving on

**Question Generation Logic:**
- Based on first incomplete lesson in user's training plan
- Generates up to 5 relevant questions
- Questions adapt to lesson content (equipment, safety notes, etc.)
- Returns empty array if no current lessons

**Example Questions:**
- "What should I know before starting 'Basic Groundwork'?"
- "How do I know if I'm doing 'Leading Exercises' correctly?"
- "What are common mistakes to avoid in 'First Mount'?"
- "What equipment do I need for 'Lunging Basics'?"
- "How do I know when I'm ready to move on from 'Walk-Trot Transitions'?"

## API Endpoints

### Suggested Questions
- `GET /api/training/suggested-questions`
  - Returns: `{ questions: string[] }`
  - Requires authentication
  - Based on user's current incomplete lessons

### Method Preference (Updated)
- `POST /api/methods/preference`
  - Body: `{ primaryMethodId: string, showComparisons: boolean }`
  - Creates or updates user's method preference

## User Experience Flow

### Onboarding with Method Selection

1. User completes experience level selection
2. User selects primary goal
3. User sets time availability
4. **NEW:** User browses and selects training method
5. User provides horse ownership details
6. Profile and method preference saved
7. Training plan generated (influenced by method selection)

### Using Comparison Feature

1. User opens Ask the Trainer
2. Toggle "Compare methods" switch (if method preference exists)
3. Ask question as normal
4. AI responds with:
   - Primary method perspective (if comparisons enabled)
   - Comparison with 1-2 other methods
   - Highlighted similarities/differences
5. Toggle can be changed anytime

### Suggested Questions Usage

1. User opens chat interface
2. Suggested questions appear above message list
3. Questions based on current lesson in training plan
4. User clicks question to insert into input
5. User can modify or send as-is
6. Questions refresh when lesson changes

## Data Models

### UserMethodPreference (Updated)
```typescript
{
  id: string;
  userId: string;
  primaryMethodId: string;
  primaryMethod: HorsemanshipMethod;
  showComparisons: boolean; // NEW: Comparison toggle state
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

## Future Enhancements

1. **Method Info Cards**: Detailed method descriptions with examples
2. **Method Switching**: Change method per conversation
3. **Method Recommendations**: Suggest methods based on user goals
4. **Comparison Depth Control**: Choose how many methods to compare
5. **Method Learning Path**: Suggested lessons for specific methods
6. **Method-specific Equipment Lists**: Tailored gear recommendations

## Testing Checklist

- [ ] Method selection saves correctly during onboarding
- [ ] Comparison toggle updates user preference
- [ ] AI provides comparisons when toggle enabled
- [ ] Suggested questions appear in chat
- [ ] Questions adapt to current lesson
- [ ] Clicking question inserts into input
- [ ] Methods load correctly in onboarding
- [ ] Method categories display properly
- [ ] "No preference" option works
- [ ] Comparison feature works with different methods

