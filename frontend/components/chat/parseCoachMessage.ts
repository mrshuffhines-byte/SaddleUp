/**
 * Parses AI coach messages to extract structured data like steps and "when to stop" sections
 */

export interface ParsedCoachMessage {
  intro: string;
  steps?: Array<{ number: number; text: string; timeEstimate?: string }>;
  whenToStop?: string;
  hasSafetyConcern?: boolean;
}

export function parseCoachMessage(content: string): ParsedCoachMessage {
  const result: ParsedCoachMessage = {
    intro: content,
  };

  // Check for safety concerns (simple keyword matching)
  const safetyKeywords = ['danger', 'dangerous', 'medical', 'vet', 'veterinarian', 'emergency', 'serious', 'injure'];
  result.hasSafetyConcern = safetyKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );

  // Try to parse numbered steps (e.g., "1. Step text (5 minutes)")
  const stepPattern = /(?:^|\n)\s*(\d+)\.\s*([^\n]+?)(?:\s*\(([^)]+)\))?/g;
  const steps: Array<{ number: number; text: string; timeEstimate?: string }> = [];
  let match;

  while ((match = stepPattern.exec(content)) !== null) {
    steps.push({
      number: parseInt(match[1], 10),
      text: match[2].trim(),
      timeEstimate: match[3]?.trim(),
    });
  }

  if (steps.length > 0) {
    result.steps = steps;
  }

  // Try to extract "when to stop" section
  // Look for patterns like "When to stop:", "Stop if:", "Stop when:"
  const stopPattern = /(?:when to stop|stop if|stop when)[:]\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/i;
  const stopMatch = content.match(stopPattern);
  if (stopMatch && stopMatch[1]) {
    result.whenToStop = stopMatch[1].trim();
    // Remove it from intro if present
    result.intro = content.replace(stopPattern, '').trim();
  } else if (steps.length > 0) {
    // If we have steps but no explicit "when to stop", keep the intro as is
    // and remove steps from intro
    const stepsText = steps.map(s => `${s.number}. ${s.text}${s.timeEstimate ? ` (${s.timeEstimate})` : ''}`).join('\n');
    result.intro = result.intro.replace(stepsText, '').trim();
  }

  return result;
}
