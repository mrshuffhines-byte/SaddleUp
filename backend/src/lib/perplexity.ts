/**
 * Perplexity API integration for AI chat responses and training plan generation
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * Call Perplexity API for chat completion
 */
export async function callPerplexityAPI(
  messages: ChatMessage[],
  model: string = 'sonar'
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not set');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Perplexity API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage += ` - ${errorJson.error?.message || errorJson.message || errorText}`;
    } catch {
      errorMessage += ` - ${errorText.substring(0, 200)}`;
    }
    console.error('Perplexity API error:', response.status, errorText);
    throw new Error(errorMessage);
  }

  const data = await response.json() as PerplexityResponse;
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from Perplexity API');
  }

  return data.choices[0].message.content;
}

/**
 * Call Perplexity API with a system prompt and user message
 */
export async function callPerplexityWithPrompt(
  systemPrompt: string,
  userMessage: string,
  model: string = 'sonar'
): Promise<string> {
  return callPerplexityAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ], model);
}
