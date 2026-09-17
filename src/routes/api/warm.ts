import { createFileRoute } from '@tanstack/react-router'
import { apiKey } from '../../jev'
import { SECURITY_HEADERS, guard, limiterKind } from '../../guard'

const ISOLATE = Math.random().toString(36).slice(2, 8) // temporary diagnostic

// Opens the HTTPS connection to TypeSafe from this Worker so the next
// evaluation reuses it instead of paying a fresh TCP + TLS handshake.
export const Route = createFileRoute('/api/warm')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const blocked = await guard(request)
        if (blocked) return blocked
        try {
          const res = await fetch('https://api.typesafe.ai/v1/models', {
            headers: { authorization: `Bearer ${await apiKey()}` },
          })
          await res.arrayBuffer()
        } catch {
          // warm-up is best effort
        }
        return new Response(null, {
          status: 204,
          headers: {
            'cache-control': 'no-store',
            ...SECURITY_HEADERS,
            'x-diag-isolate': ISOLATE,
            'x-diag-limiter': await limiterKind(),
            'x-diag-ip': request.headers.get('cf-connecting-ip') ?? 'none',
            'x-diag-xff': request.headers.get('x-forwarded-for') ?? 'none',
            'x-diag-colo': request.headers.get('cf-ray') ?? 'none',
          },
        })
      },
    },
  },
})
