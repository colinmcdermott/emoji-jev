import { experimental_evaluate as evaluate } from 'ai'
import { createTypeSafeAi } from '@ai-sdk/typesafe-ai'
import { SIZES, buildQuestions, type ReactResponse, type Size } from './emoji'

const QUESTIONS = { small: buildQuestions('small'), medium: buildQuestions('medium'), full: buildQuestions('full') }
const USD_PER_INPUT_TOKEN = 0.042 / 1_000_000

export async function apiKey(): Promise<string> {
  // Whop injects app secrets as Worker env bindings. Prefer the binding, fall back to process.env.
  let key: string | undefined
  try {
    key = (await import('cloudflare:workers')).env.TYPESAFE_AI_API_KEY
  } catch {
    // not running inside a Worker
  }
  key ||= process.env.TYPESAFE_AI_API_KEY
  if (!key) throw new Error('TYPESAFE_AI_API_KEY is not set (whop apps secrets set --secret TYPESAFE_AI_API_KEY=...)')
  return key
}

export async function react(text: string, size: Size = 'full', signal?: AbortSignal): Promise<ReactResponse> {
  const model = createTypeSafeAi({ apiKey: await apiKey() }).evaluationModel('jev-latest')
  const started = performance.now()
  const r = await evaluate({ model, state: { message: text.slice(0, 2000) }, questions: QUESTIONS[size], abortSignal: signal })
  const serverMs = performance.now() - started
  const inputTokens = r.usage?.inputTokens ?? 0
  // TypeSafe reports its own processing time; the rest of serverMs is network between this Worker and their API.
  const upstream = Number(r.response?.headers?.['x-envoy-upstream-service-time'])
  const modelMs = Number.isFinite(upstream) && upstream > 0 ? upstream : undefined
  const confidence = (r.providerMetadata?.typesafe?.confidence as Record<string, number> | undefined)?.emoji
  return {
    via: 'typesafe',
    modelId: r.response?.modelId,
    emoji: {
      choice: r.answers.emoji.choice,
      probabilities: r.answers.emoji.probabilities ?? { [r.answers.emoji.choice]: 1 },
      confidence,
    },
    mood: { score: r.answers.mood.score, probabilities: r.answers.mood.probabilities ?? {} },
    urgency: { score: r.answers.urgency.score, probabilities: r.answers.urgency.probabilities ?? {} },
    sarcasm: r.answers.sarcasm.probability,
    joke: r.answers.joke.probability,
    options: SIZES[size],
    usage: { inputTokens, outputTokens: r.usage?.outputTokens ?? 0 },
    costUsd: inputTokens * USD_PER_INPUT_TOKEN,
    timing: { serverMs, modelMs },
  }
}
