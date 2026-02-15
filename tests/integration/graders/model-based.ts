import Anthropic from '@anthropic-ai/sdk';
import type { GraderResult, ModelGraderDetails, UsageStats } from '../types';
import { accumulateUsage } from '../utils';

const client = new Anthropic({ maxRetries: 5 });

const GRADER_MODEL = process.env.INTEGRATION_GRADER_MODEL ?? 'claude-haiku-4-5';

const GRADER_SYSTEM_PROMPT = `You are a strict document quality evaluator. You score AI-generated documents against rubrics.

You MUST respond with a single JSON object and nothing else. No markdown, no explanation, no preamble.

Required JSON schema:
{
  "scores": { "<dimension_name>": <0.0-1.0>, ... },
  "overall": <0.0-1.0>,
  "feedback": "<brief actionable feedback>"
}

Rules:
- Every dimension in the rubric must appear in "scores"
- "overall" is the weighted average reflecting relative importance of each dimension
- "feedback" is 1-3 sentences, specific and actionable
- Output ONLY the JSON object`;

export async function runModelGrader(
  output: string,
  rubric: string,
  threshold = 0.7,
  reference?: string,
  usageAccumulator?: UsageStats
): Promise<GraderResult> {
  const prompt = buildGraderPrompt(output, rubric, reference);

  const response = await client.messages.create({
    model: GRADER_MODEL,
    max_tokens: 1024,
    system: GRADER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  if (usageAccumulator) {
    accumulateUsage(usageAccumulator, response.usage, GRADER_MODEL);
  }

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  let details: ModelGraderDetails;
  try {
    details = parseGraderResponse(responseText);
  } catch {
    details = {
      scores: {},
      overall: 0,
      feedback: `Failed to parse grader response: ${responseText}`,
    };
  }

  return {
    type: 'model',
    passed: details.overall >= threshold,
    score: details.overall,
    details,
  };
}

/**
 * Parse grader response with multiple extraction strategies.
 * Tries direct parse first, then extracts JSON from surrounding text.
 */
export function parseGraderResponse(responseText: string): ModelGraderDetails {
  const trimmed = responseText.trim();

  // Strategy 1: Direct parse (response is pure JSON)
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (isValidGraderDetails(parsed)) return parsed as ModelGraderDetails;
  } catch {
    // Fall through to next strategy
  }

  // Strategy 2: Extract JSON from markdown code fence
  const codeFenceMatch = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(trimmed);
  if (codeFenceMatch) {
    try {
      const parsed: unknown = JSON.parse(codeFenceMatch[1]);
      if (isValidGraderDetails(parsed)) return parsed as ModelGraderDetails;
    } catch {
      // Fall through
    }
  }

  // Strategy 3: Find outermost JSON object (greedy match from first { to last })
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = trimmed.slice(firstBrace, lastBrace + 1);
      const parsed: unknown = JSON.parse(jsonStr);
      if (isValidGraderDetails(parsed)) return parsed as ModelGraderDetails;
    } catch {
      // Fall through
    }
  }

  throw new Error('No valid grader JSON found in response');
}

function isValidGraderDetails(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.scores === 'object' &&
    record.scores !== null &&
    typeof record.overall === 'number' &&
    typeof record.feedback === 'string'
  );
}

function buildGraderPrompt(output: string, rubric: string, reference?: string): string {
  return `${reference ? `## Reference Solution (for comparison)\n${reference}\n\n` : ''}## Document to Evaluate
${output}

## Evaluation Rubric
${rubric}

Score each dimension on 0-1 and provide overall score with feedback.`;
}
