import { createFileRoute } from '@tanstack/react-router'
import { react } from '../../jev'
import { SIZES, type Size } from '../../emoji'
import { guard, json, methodNotAllowed } from '../../guard'

export const Route = createFileRoute('/api/react')({
  server: {
    handlers: {
      GET: () => methodNotAllowed('POST'),
      POST: async ({ request }) => {
        const blocked = await guard(request)
        if (blocked) return blocked
        const body = (await request.json().catch(() => ({}))) as { text?: unknown; size?: unknown }
        const size: Size = typeof body.size === 'string' && Object.hasOwn(SIZES, body.size) ? (body.size as Size) : 'full'
        if (typeof body.text !== 'string' || !body.text.trim()) {
          return json({ error: 'text is required' }, 400)
        }
        try {
          return json(await react(body.text, size, request.signal))
        } catch (err) {
          // The AI SDK wraps repeated failures in a RetryError; the useful status lives on the last attempt.
          const raw = err as { message?: string; statusCode?: number; lastError?: unknown; responseBody?: string }
          const last = (raw.lastError ?? raw) as { message?: string; statusCode?: number; responseBody?: string }
          const status = last.statusCode
          const text = `${last.responseBody ?? ''} ${last.message ?? ''}`
          console.error('evaluate failed', status, text.slice(0, 300))
          if (status === 429) return json({ error: 'Jev is rate limiting right now. Try again in a moment.' }, 429, { 'retry-after': '3' })
          if (status === 401 || status === 403) return json({ error: 'The API key was rejected upstream.' }, 502)
          if (status === 529 || /model_unavailable|overloaded/i.test(text)) {
            return json({ error: 'Jev is briefly unavailable upstream. Retrying…' }, 503, { 'retry-after': '2' })
          }
          return json({ error: 'Evaluation failed. Try again.' }, 502)
        }
      },
    },
  },
})
