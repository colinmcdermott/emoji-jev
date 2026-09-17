import { createFileRoute } from '@tanstack/react-router'
import { resolveModel } from '../../jev'
import { SECURITY_HEADERS, guard } from '../../guard'

// Opens the HTTPS connection to TypeSafe from this Worker so the next
// evaluation reuses it instead of paying a fresh TCP + TLS handshake.
export const Route = createFileRoute('/api/warm')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const blocked = await guard(request)
        if (blocked) return blocked
        try {
          const { via, key } = await resolveModel()
          const res =
            via === 'typesafe'
              ? await fetch('https://api.typesafe.ai/v1/models', { headers: { authorization: `Bearer ${key}` } })
              : await fetch('https://ai-gateway.vercel.sh/v1/credits', { headers: { authorization: `Bearer ${key}` } })
          await res.arrayBuffer()
        } catch {
          // warm-up is best effort
        }
        return new Response(null, { status: 204, headers: { 'cache-control': 'no-store', ...SECURITY_HEADERS } })
      },
    },
  },
})
