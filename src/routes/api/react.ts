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
          const e = err as { message?: string; statusCode?: number }
          if (e.statusCode === 429) return json({ error: 'Rate limited by TypeSafe. Try again in a moment.' }, 429)
          if (e.statusCode === 401) return json({ error: 'The TypeSafe API key was rejected.' }, 502)
          console.error('evaluate failed', e.statusCode, e.message)
          return json({ error: 'Evaluation failed. Try again.' }, 502)
        }
      },
    },
  },
})
