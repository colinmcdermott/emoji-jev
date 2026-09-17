import { createFileRoute } from '@tanstack/react-router'
import { react } from '../../jev'

export const Route = createFileRoute('/api/react')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { text?: unknown }
        if (typeof body.text !== 'string' || !body.text.trim()) {
          return Response.json({ error: 'text is required' }, { status: 400 })
        }
        try {
          return Response.json(await react(body.text, request.signal))
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
