import 'server-only';
import { CATEGORIES, type CategoryId } from '@/lib/categories';

// Optional: classify unknown merchants with Claude Haiku. Active only when
// ANTHROPIC_API_KEY is set — otherwise this returns an empty map and the sync
// just leaves those merchants as "Other". Results are cached per merchant by the
// caller, so the model is only queried for genuinely new merchants.

const VALID = new Set<string>(CATEGORIES.filter((c) => c.id !== 'Income').map((c) => c.id));
const CATEGORY_LIST = CATEGORIES.filter((c) => c.id !== 'Income')
  .map((c) => c.id)
  .join(', ');

export function isLlmCategorizationEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Classify merchant names into DollarMemo categories. Returns a map of
 * merchant -> category (only entries the model was confident about). Safe to
 * call without a key or on error — it just returns an empty map.
 */
export async function llmCategorize(merchants: string[]): Promise<Map<string, CategoryId>> {
  const out = new Map<string, CategoryId>();
  if (!isLlmCategorizationEnabled() || merchants.length === 0) return out;

  // Cap how many we send in one go to keep latency/cost bounded.
  const batch = merchants.slice(0, 60);

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:
        `You categorize bank/card transaction merchants for a personal finance app. ` +
        `Choose exactly one category for each merchant from this list: ${CATEGORY_LIST}. ` +
        `Use "Other" only when none clearly fit. Reply with ONLY a JSON array of ` +
        `{"merchant": string, "category": string} objects, no prose.`,
      messages: [{ role: 'user', content: JSON.stringify(batch) }],
    });

    const text = resp.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const json = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
    const parsed = JSON.parse(json) as { merchant: string; category: string }[];

    for (const item of parsed) {
      if (item && typeof item.merchant === 'string' && VALID.has(item.category)) {
        out.set(item.merchant, item.category as CategoryId);
      }
    }
  } catch {
    // Network/parse/key error — fall back silently (merchants stay "Other").
  }
  return out;
}
