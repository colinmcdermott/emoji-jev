import { experimental_evaluate as evaluate } from 'ai'
import { createTypeSafeAi } from '@ai-sdk/typesafe-ai'
import { createGateway } from '@ai-sdk/gateway'
import { SIZES, buildQuestions, type Emotion, type ReactResponse, type Size } from './emoji'

const QUESTIONS = { small: buildQuestions('small'), medium: buildQuestions('medium'), full: buildQuestions('full') }
const USD_PER_INPUT_TOKEN = 0.042 / 1_000_000

async function secret(name: 'TYPESAFE_AI_API_KEY' | 'AI_GATEWAY_API_KEY'): Promise<string | undefined> {
  // Whop injects app secrets as Worker env bindings. Prefer the binding, fall back to process.env.
  let value: string | undefined
  try {
    value = (await import('cloudflare:workers')).env[name]
  } catch {
    // not running inside a Worker
  }
  return value || process.env[name] || undefined
}

export type Via = 'typesafe' | 'gateway'

/**
 * Two ways to reach Jev: TypeSafe's API directly (early access key) or Vercel
 * AI Gateway (any Vercel account). The first key found wins.
 */
export async function resolveModel(): Promise<{ via: Via; key: string; model: ReturnType<ReturnType<typeof createTypeSafeAi>['evaluationModel']> }> {
  const ts = await secret('TYPESAFE_AI_API_KEY')
  if (ts) return { via: 'typesafe', key: ts, model: createTypeSafeAi({ apiKey: ts }).evaluationModel('jev-latest') }
  const gw = await secret('AI_GATEWAY_API_KEY')
  if (gw) return { via: 'gateway', key: gw, model: createGateway({ apiKey: gw }).evaluationModel('typesafe-ai/jev') }
  throw new Error(
    'No API key configured. Set TYPESAFE_AI_API_KEY (console.typesafe.ai) or AI_GATEWAY_API_KEY (Vercel AI Gateway) with `whop apps secrets set`.',
  )
}

export async function react(text: string, size: Size = 'full', signal?: AbortSignal): Promise<ReactResponse> {
  const { via, model } = await resolveModel()
  const started = performance.now()
  const r = await evaluate({ model, state: { message: text.slice(0, 2000) }, questions: QUESTIONS[size], abortSignal: signal })
  const serverMs = performance.now() - started
  const inputTokens = r.usage?.inputTokens ?? 0
  // TypeSafe reports its own processing time; the rest of serverMs is network between this Worker and their API.
  const upstream = Number(r.response?.headers?.['x-envoy-upstream-service-time'])
  const gw = r.providerMetadata?.gateway as
    | { cost?: string; routing?: { modelAttempts?: { providerAttempts?: { startTime?: number; endTime?: number }[] }[] } }
    | undefined
  const attempt = gw?.routing?.modelAttempts?.[0]?.providerAttempts?.[0]
  const modelMs =
    Number.isFinite(upstream) && upstream > 0
      ? upstream
      : attempt?.startTime && attempt?.endTime
        ? attempt.endTime - attempt.startTime
        : undefined
  const confidence = (r.providerMetadata?.typesafe?.confidence as Record<string, number> | undefined)?.emoji
  return {
    via,
    modelId: r.response?.modelId,
    emoji: {
      choice: r.answers.emoji.choice,
      probabilities: r.answers.emoji.probabilities ?? { [r.answers.emoji.choice]: 1 },
      confidence,
    },
    mood: { score: r.answers.mood.score, probabilities: r.answers.mood.probabilities ?? {} },
    urgency: { score: r.answers.urgency.score, probabilities: r.answers.urgency.probabilities ?? {} },
    energy: { score: r.answers.energy.score, probabilities: r.answers.energy.probabilities ?? {} },
    emotion: {
      choice: r.answers.emotion.choice as Emotion,
      probabilities: r.answers.emotion.probabilities ?? { [r.answers.emotion.choice]: 1 },
    },
    sarcasm: r.answers.sarcasm.probability,
    joke: r.answers.joke.probability,
    wantsReply: r.answers.wantsReply.probability,
    options: SIZES[size],
    usage: { inputTokens, outputTokens: r.usage?.outputTokens ?? 0 },
    costUsd: gw?.cost ? Number(gw.cost) : inputTokens * USD_PER_INPUT_TOKEN,
    timing: { serverMs, modelMs },
  }
}
