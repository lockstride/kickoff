import Anthropic from '@anthropic-ai/sdk';

export interface RateLimits {
  requestsPerMinute: number;
  inputTokensPerMinute: number;
  outputTokensPerMinute: number;
}

/**
 * Make a minimal API call to detect the org's rate limits for the given model.
 * Returns null if the probe fails (no API key, network error, etc.).
 */
export async function probeRateLimits(model: string): Promise<RateLimits | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const client = new Anthropic();
    const { response } = await client.messages
      .create({
        model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      })
      .withResponse();

    const get = (h: string) => parseInt(response.headers.get(h) ?? '0', 10);

    return {
      requestsPerMinute: get('anthropic-ratelimit-requests-limit'),
      inputTokensPerMinute: get('anthropic-ratelimit-input-tokens-limit'),
      outputTokensPerMinute: get('anthropic-ratelimit-output-tokens-limit'),
    };
  } catch {
    return null;
  }
}

const FALLBACK_WORKERS = 2;
const OUTPUT_TPM_PER_WORKER = 10_000;
const MAX_WORKERS = 16;

/**
 * Calculate optimal maxWorkers from detected rate limits.
 *
 * Uses output TPM as the primary constraint (typically the tightest).
 * Budget: ~10,000 output tokens per minute per concurrent worker.
 *
 * Examples:
 *   10k output TPM (Build tier)  → 1 worker
 *   40k output TPM               → 4 workers
 *   80k output TPM (Scale tier)  → 8 workers
 *   200k+ output TPM             → 16 workers (cap)
 */
export function calculateMaxWorkers(limits: RateLimits | null): number {
  if (!limits || limits.outputTokensPerMinute === 0) return FALLBACK_WORKERS;
  return Math.max(
    1,
    Math.min(Math.floor(limits.outputTokensPerMinute / OUTPUT_TPM_PER_WORKER), MAX_WORKERS)
  );
}
