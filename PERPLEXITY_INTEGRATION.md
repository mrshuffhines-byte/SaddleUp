# Perplexity API Integration

## Overview

SaddleUp now uses Perplexity API instead of Anthropic Claude for AI-powered features:
- Chat responses in "Ask the Trainer"
- Training plan generation
- Context-aware AI recommendations

## Why Perplexity?

- **Online capabilities**: Perplexity's "sonar" models have access to real-time information
- **Cost-effective**: Competitive pricing compared to other AI APIs
- **OpenAI-compatible**: Easy integration with standard chat completion format
- **Multiple models**: Choose between `sonar-small` (cheaper) and `sonar-large` (more capable)

## Configuration

### Environment Variable

Set `PERPLEXITY_API_KEY` in your `.env` file:

```env
PERPLEXITY_API_KEY="your-perplexity-api-key"
```

Get your API key from: https://www.perplexity.ai/settings/api

### Model Selection

Default model: `llama-3.1-sonar-large-128k-online`

**Available models:**
- `llama-3.1-sonar-large-128k-online` - Most capable, has web access
- `llama-3.1-sonar-small-128k-online` - Faster, cheaper, has web access
- `llama-3.1-sonar-large-32k-online` - Similar to large but smaller context
- `llama-3.1-sonar-small-32k-online` - Similar to small but smaller context

To change the model, update the `callPerplexityAPI` calls in:
- `backend/src/lib/chat.ts` (for chat responses)
- `backend/src/lib/claude.ts` (for training plan generation)

## API Usage

The integration uses a helper function `callPerplexityAPI` in `backend/src/lib/perplexity.ts`:

```typescript
import { callPerplexityAPI, callPerplexityWithPrompt } from './perplexity';

// With system prompt and user message
const response = await callPerplexityWithPrompt(
  systemPrompt,
  userMessage,
  'llama-3.1-sonar-large-128k-online'
);

// With full message array
const response = await callPerplexityAPI([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userMessage },
]);
```

## Implementation Details

### Chat Responses (`backend/src/lib/chat.ts`)

- Uses Perplexity API for generating chat responses
- Maintains conversation history (last 10 messages)
- Includes comprehensive context (horse profile, rider experience, facility constraints)
- Supports media analysis with timestamp extraction

### Training Plan Generation (`backend/src/lib/claude.ts`)

- Uses Perplexity API to generate structured training plans
- Expects JSON response (cleans up markdown code blocks if present)
- Creates phases > modules > lessons hierarchy
- Includes safety considerations and professional help flags

## Error Handling

The integration includes error handling for:
- Missing API key
- API request failures
- Invalid response format
- JSON parsing errors (for training plans)

## Cost Considerations

**Perplexity Pricing** (as of integration date):
- `sonar-small`: Lower cost, good for simple queries
- `sonar-large`: Higher cost, better for complex reasoning

Monitor your usage at: https://www.perplexity.ai/settings/api

## Migration Notes

**Changed from Anthropic Claude:**
- Removed `@anthropic-ai/sdk` dependency
- Changed environment variable: `ANTHROPIC_API_KEY` → `PERPLEXITY_API_KEY`
- Updated API call format to OpenAI-compatible structure
- Response parsing adjusted for Perplexity's format

**No Breaking Changes:**
- All API endpoints remain the same
- Response format to frontend is unchanged
- Existing conversation history works the same way

## Testing

To test the Perplexity integration:

1. Set `PERPLEXITY_API_KEY` in `.env`
2. Start the backend server
3. Test chat endpoint: `POST /api/messages`
4. Test training plan generation: `POST /api/training/generate-plan`

Check server logs for any API errors or issues.
