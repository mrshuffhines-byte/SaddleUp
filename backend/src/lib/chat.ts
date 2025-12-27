import { prisma } from './prisma';
import { callPerplexityAPI } from './perplexity';

interface TimestampReference {
  timestamp: string; // e.g., "0:15", "0:20-0:25"
  text: string; // The observation at that timestamp
  type?: 'positive' | 'concern' | 'instruction';
}

/**
 * Extracts timestamp references from AI response text
 * Looks for patterns like "At 0:15", "At 0:20-0:25", "Around 0:30", "Between 0:10 and 0:15"
 */
function extractTimestampAnalysis(responseText: string, mediaUrls: string[]): any {
  const timestampPattern = /(?:At|Around|Between|From)\s+(\d+):(\d+)(?:-(\d+):(\d+))?(?:\s+and\s+(\d+):(\d+))?/gi;
  const timestamps: TimestampReference[] = [];
  
  // Find all timestamp mentions
  const matches = [...responseText.matchAll(timestampPattern)];
  
  matches.forEach((match) => {
    const startMinutes = parseInt(match[1]);
    const startSeconds = parseInt(match[2]);
    let endMinutes: number | undefined;
    let endSeconds: number | undefined;
    
    // Check for range format (e.g., "0:15-0:20" or "0:15 and 0:20")
    if (match[3] && match[4]) {
      endMinutes = parseInt(match[3]);
      endSeconds = parseInt(match[4]);
    } else if (match[5] && match[6]) {
      endMinutes = parseInt(match[5]);
      endSeconds = parseInt(match[6]);
    }
    
    const startTime = startMinutes * 60 + startSeconds;
    const timestamp = endMinutes !== undefined && endSeconds !== undefined
      ? `${startMinutes}:${startSeconds.toString().padStart(2, '0')}-${endMinutes}:${endSeconds.toString().padStart(2, '0')}`
      : `${startMinutes}:${startSeconds.toString().padStart(2, '0')}`;
    
    // Extract surrounding text (up to 200 chars) for context
    const matchIndex = match.index || 0;
    const contextStart = Math.max(0, matchIndex - 50);
    const contextEnd = Math.min(responseText.length, matchIndex + match[0].length + 200);
    const contextText = responseText.substring(contextStart, contextEnd);
    
    // Try to determine type based on keywords
    const lowerContext = contextText.toLowerCase();
    let type: 'positive' | 'concern' | 'instruction' | undefined;
    if (lowerContext.includes('good') || lowerContext.includes('nice') || lowerContext.includes('well') || lowerContext.includes('correct')) {
      type = 'positive';
    } else if (lowerContext.includes('wrong') || lowerContext.includes('issue') || lowerContext.includes('problem') || lowerContext.includes('concern') || lowerContext.includes('worry')) {
      type = 'concern';
    } else if (lowerContext.includes('try') || lowerContext.includes('should') || lowerContext.includes('need to') || lowerContext.includes('focus on')) {
      type = 'instruction';
    }
    
    timestamps.push({
      timestamp,
      text: contextText.trim(),
      type,
    });
  });
  
  // Remove duplicates and sort by timestamp
  const uniqueTimestamps = Array.from(
    new Map(timestamps.map(t => [t.timestamp, t])).values()
  ).sort((a, b) => {
    const timeA = parseTimestampToSeconds(a.timestamp);
    const timeB = parseTimestampToSeconds(b.timestamp);
    return timeA - timeB;
  });
  
  return {
    hasMedia: true,
    mediaCount: mediaUrls.length,
    timestampReferences: uniqueTimestamps,
    hasVideoTimestamps: uniqueTimestamps.length > 0,
  };
}

/**
 * Converts timestamp string to seconds for sorting
 * Handles formats like "0:15" or "0:15-0:20" (takes start time)
 */
function parseTimestampToSeconds(timestamp: string): number {
  const match = timestamp.match(/(\d+):(\d+)/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }
  return 0;
}

import { ComprehensiveContext, buildComprehensiveContext, buildAIContextPrompt } from './context-builder';

interface UserContext {
  experienceLevel?: string;
  primaryGoal?: string;
  currentLessons?: any[];
  methodPreference?: any;
  conversationMethod?: any;
  showComparisons?: boolean;
  comprehensiveContext?: ComprehensiveContext;
}

interface ChatResponse {
  content: string;
  mediaAnalysis?: any;
}

export async function generateChatResponse(params: {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userContext: UserContext;
  mediaUrls?: string[];
  comprehensiveContext?: ComprehensiveContext;
}): Promise<ChatResponse> {
  const { userMessage, conversationHistory, userContext, mediaUrls = [], comprehensiveContext } = params;

  // Build context prompt
  let contextPrompt = `You are a knowledgeable, patient, and beginner-friendly horse trainer assistant. Your role is to help horse owners with practical, safe advice.\n\n`;
  
  // Add comprehensive context if available
  if (comprehensiveContext) {
    contextPrompt += buildAIContextPrompt(comprehensiveContext);
  }

  // Add user experience level context
  if (userContext.experienceLevel) {
    const experienceDescriptions: Record<string, string> = {
      complete_beginner: 'a complete beginner with no prior horse experience',
      some_experience: 'someone with some prior experience with horses',
      returning_rider: 'a returning rider who needs to refresh their skills',
      experienced: 'an experienced rider looking to refine their skills',
    };
    contextPrompt += `The user is ${experienceDescriptions[userContext.experienceLevel] || userContext.experienceLevel}.\n\n`;
  }

  // Add method preference context
  const method = userContext.conversationMethod || userContext.methodPreference;
  const showComparisons = userContext.showComparisons || false;
  
  if (method) {
    contextPrompt += `The user is interested in ${method.name} (${method.category}). `;
    if (method.philosophy) {
      contextPrompt += `Philosophy: ${method.philosophy}. `;
    }
    if (method.keyPrinciples) {
      contextPrompt += `Key principles: ${JSON.stringify(method.keyPrinciples)}. `;
    }
    if (method.commonTerminology) {
      contextPrompt += `Common terminology: ${JSON.stringify(method.commonTerminology)}. `;
    }
    
    if (showComparisons) {
      contextPrompt += `\n**IMPORTANT: The user wants to compare different training approaches.** `;
      contextPrompt += `When answering, provide the perspective from ${method.name} first, then briefly compare with 1-2 other common approaches (e.g., classical dressage, natural horsemanship, positive reinforcement). `;
      contextPrompt += `Explain how different methods approach the same question, highlighting similarities and differences.\n\n`;
    } else {
      contextPrompt += `\nFrame your answers through this method's perspective, use its terminology, and reference its specific exercises or principles when applicable.\n\n`;
    }
  }

  // Add current training plan context
  if (userContext.currentLessons && userContext.currentLessons.length > 0) {
    contextPrompt += `The user's current training plan includes these upcoming lessons:\n`;
    userContext.currentLessons.forEach((lesson: any) => {
      contextPrompt += `- Phase ${lesson.phaseNumber}, Module ${lesson.moduleNumber}, Lesson ${lesson.lessonNumber}: ${lesson.title}\n`;
    });
    contextPrompt += `\nYou can reference these lessons when relevant. For example: "This relates to Module ${userContext.currentLessons[0]?.moduleNumber || 1}, Lesson ${userContext.currentLessons[0]?.lessonNumber || 1} in your plan."\n\n`;
  }

  // Add media analysis instructions if media is present
  if (mediaUrls.length > 0) {
    contextPrompt += `\n**MEDIA ANALYSIS REQUIRED**\n`;
    contextPrompt += `The user has attached ${mediaUrls.length} media file(s) for analysis.\n\n`;
    
    contextPrompt += `**For VIDEO analysis:**\n`;
    contextPrompt += `- Watch the entire video carefully before responding\n`;
    contextPrompt += `- Provide timestamp-specific feedback using the format: "At 0:XX" or "At 0:XX-0:YY" or "Around 0:XX" or "Between 0:XX and 0:YY"\n`;
    contextPrompt += `- Break down your observations by time segments when analyzing movement, technique, or behavior changes\n`;
    contextPrompt += `- Use timestamps to pinpoint specific moments: transitions, posture changes, behavioral cues, etc.\n`;
    contextPrompt += `- Structure your video feedback like this:\n`;
    contextPrompt += `  **At 0:05-0:12:** [observation]\n`;
    contextPrompt += `  **At 0:18-0:25:** [observation]\n`;
    contextPrompt += `  **At 0:30:** [observation]\n`;
    contextPrompt += `- Note what's working well and what needs improvement with timestamp references\n`;
    contextPrompt += `- If you notice patterns or recurring issues, mention the timestamps where they occur\n\n`;
    
    contextPrompt += `**For PHOTO analysis:**\n`;
    contextPrompt += `- Describe what you see in detail\n`;
    contextPrompt += `- Point out specific elements: positioning, posture, equipment placement, etc.\n`;
    contextPrompt += `- Provide constructive feedback on what's correct and what could be adjusted\n`;
    contextPrompt += `- Use visual descriptions ("You can see...", "Notice how...", "The... is positioned...")`;
    
    contextPrompt += `\n\nAlways be specific, constructive, and encouraging. Reference visual details you observe.\n\n`;
  }

  contextPrompt += `\n**Response Guidelines:**
- Use plain language, avoid jargon without defining it
- Include visual descriptions ("You'll see...", "Notice how...")
- For riding questions, include "what you'll feel" descriptions
- Acknowledge when something requires eyes-on professional help
- Offer to save helpful answers to their personal reference library
- Be encouraging and supportive, especially for beginners
- If the question is about safety, prioritize safety warnings
- If analyzing media, be specific about timestamps (for video) and what you observe
- Reference the user's current lessons when relevant

**Formatting:**
- Use markdown formatting for readability
- Use headers (##) for sections
- Use bullet points for lists
- Use bold for emphasis
- For video feedback, include timestamp references like "At 0:15-0:20" or "Around the 0:30 mark"\n\n`;

  // Build conversation messages
  const messages: any[] = conversationHistory
    .slice(-10) // Last 10 messages for context
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Add current user message
  const userMessageContent = mediaUrls.length > 0
    ? `${userMessage}\n\n[User has attached ${mediaUrls.length} media file(s) for analysis]`
    : userMessage;

  messages.push({
    role: 'user',
    content: userMessageContent,
  });

  try {
    // Build messages array for Perplexity (includes system as first message)
    const perplexityMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: contextPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const responseText = await callPerplexityAPI(perplexityMessages);

    // Extract timestamp references from video analysis
    const mediaAnalysis = mediaUrls.length > 0 ? extractTimestampAnalysis(responseText, mediaUrls) : undefined;

    return {
      content: responseText,
      mediaAnalysis,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response');
  }
}
