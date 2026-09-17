import { createFileRoute } from '@tanstack/react-router'
import { react } from '../../jev'
import { SIZES, type Size } from '../../emoji'

export const Route = createFileRoute('/api/react')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { text?: unknown; size?: unknown }
        const size: Size = typeof body.size === 'string' && body.size in SIZES ? (body.size as Size) : 'full'
        if (typeof body.text !== 'string' || !body.text.trim()) {
          return Response.json({ error: 'text is required' }, { status: 400 })
        }
        try {
          return Response.json(await react(body.text, size, request.signal))
        } catch (err) {
          const e = err as { message?: string; statusCode?: number }
          const status = e.statusCode === 429 ? 429 : e.statusCode === 401 ? 401 : 502
          const message =
            e.statusCode === 429
              ? 'Rate limited. Wait a moment and try again.'
              : e.statusCode === 401
                ? 'The TypeSafe API key was rejected.'
                : (e.message ?? 'evaluation failed')
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
