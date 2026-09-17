import { experimental_evaluate as evaluate } from 'ai'
import { createTypeSafeAi } from '@ai-sdk/typesafe-ai'
import { EMOJIS, buildQuestions, type ReactResponse } from './emoji'

const QUESTIONS = buildQuestions()
const USD_PER_INPUT_TOKEN = 0.042 / 1_000_000

async function apiKey(): Promise<string> {
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

export async function react(text: string, signal?: AbortSignal): Promise<ReactResponse> {
  const model = createTypeSafeAi({ apiKey: await apiKey() }).evaluationModel('jev-latest')
  const started = performance.now()
  const r = await evaluate({ model, state: { message: text.slice(0, 2000) }, questions: QUESTIONS, abortSignal: signal })
  const serverMs = performance.now() - started
  const inputTokens = r.usage?.inputTokens ?? 0
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
    sarcasm: r.answers.sarcasm.probability,
    options: EMOJIS.length,
    usage: { inputTokens, outputTokens: r.usage?.outputTokens ?? 0 },
    costUsd: inputTokens * USD_PER_INPUT_TOKEN,
    timing: { serverMs },
  }
}
