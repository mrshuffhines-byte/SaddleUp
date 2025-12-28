# Video Analysis with Timestamp Feedback - Implementation

## Overview

This implementation adds timestamp-based feedback to video analysis in the Ask the Trainer feature. When users upload videos and ask questions, the AI provides specific feedback with timestamp references.

## Implementation Details

### Backend Changes

#### 1. Enhanced AI Prompts (`backend/src/lib/chat.ts`)

- Added detailed instructions for video analysis
- Requires AI to use timestamp format: "At 0:XX", "At 0:XX-0:YY", "Around 0:XX", "Between 0:XX and 0:YY"
- Structured feedback format with timestamped observations
- Instructions for analyzing movement, technique, and behavioral changes

#### 2. Timestamp Extraction (`backend/src/lib/chat.ts`)

- `extractTimestampAnalysis()` function parses AI responses
- Extracts timestamp references using regex patterns
- Categorizes feedback types: 'positive', 'concern', 'instruction'
- Extracts surrounding context text for each timestamp
- Removes duplicates and sorts timestamps chronologically
- Stores in `mediaAnalysis.timestampReferences` array

#### 3. Message Response Structure

Messages now include:
```typescript
mediaAnalysis: {
  hasMedia: boolean;
  mediaCount: number;
  timestampReferences?: TimestampReference[];
  hasVideoTimestamps?: boolean;
}
```

### Frontend Changes

#### 1. Chat Interface Updates (`frontend/app/(tabs)/chat.tsx`)

- Displays timestamp badges for messages with video analysis
- Shows up to 5 timestamp references in message preview
- Clickable timestamps (ready for video player integration)
- Color-coded by feedback type (green=positive, orange=concern, blue=instruction)

#### 2. Message Detail View (`frontend/app/message-detail/[messageId].tsx`)

- Full-screen message view with video player
- Complete list of timestamp references
- Clickable timestamps that seek video to that time
- Visual indicators (icons and colors) for feedback types
- Scrollable timestamp list with full context text

#### 3. Video Analysis Component (`frontend/components/VideoAnalysisView.tsx`)

- Reusable component for displaying timestamp feedback
- Integrated with Expo AV video player
- Handles timestamp clicking to seek video
- Stylized timestamp items with type indicators

## Usage Flow

1. User uploads video and asks question
2. AI analyzes video and provides feedback with timestamps
3. Backend extracts timestamp references from AI response
4. Chat interface shows timestamp badges in message preview
5. User can click message to see full detail view
6. Detail view shows video player with all timestamps
7. User clicks timestamp to jump to that moment in video

## Timestamp Format Support

The system recognizes these timestamp formats:
- `At 0:15` - Single moment
- `At 0:15-0:20` - Time range
- `Around 0:30` - Approximate time
- `Between 0:10 and 0:15` - Range with "and"

## Feedback Type Categorization

The system automatically categorizes feedback:
- **Positive** (Green): Contains words like "good", "nice", "well", "correct"
- **Concern** (Orange): Contains words like "wrong", "issue", "problem", "worry"
- **Instruction** (Blue): Contains words like "try", "should", "need to", "focus on"

## Example AI Response with Timestamps

```
At 0:05-0:12: Your horse's poll is the highest point, which is good. 
However, I notice some tension in the jaw.

At 0:18-0:25: Here the neck looks more relaxed and the poll position 
is actually better. Notice how the nose is right at vertical.

At 0:26-0:30: The head came up and the poll dropped below the withers - 
this often happens when a horse loses relaxation.
```

## Next Steps

1. **Media Upload Integration**: Connect to Cloudinary or similar service
2. **Video Player Enhancement**: Add playback controls, scrubbing
3. **Timestamp Markers**: Visual markers on video timeline
4. **Save Timestamps**: Allow users to bookmark specific moments
5. **Multiple Video Support**: Handle multiple videos in one message
6. **Comparison View**: Side-by-side before/after videos

## Testing

To test timestamp extraction:
1. Create a conversation with a video upload
2. Ask a question that will generate timestamp-based feedback
3. Check `mediaAnalysis.timestampReferences` in the response
4. Verify timestamps are extracted and categorized correctly
5. Test timestamp clicking in the detail view

## Technical Notes

- Timestamp parsing handles both single times and ranges
- Extracts up to 200 characters of context around each timestamp
- Automatically sorts timestamps chronologically
- Removes duplicate timestamps based on time value
- Falls back gracefully if no timestamps are found

