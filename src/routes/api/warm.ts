import { createFileRoute } from '@tanstack/react-router'
import { apiKey } from '../../jev'

// Opens the HTTPS connection to TypeSafe from this Worker so the next
// evaluation reuses it instead of paying a fresh TCP + TLS handshake.
export const Route = createFileRoute('/api/warm')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch('https://api.typesafe.ai/v1/models', {
            headers: { authorization: `Bearer ${await apiKey()}` },
          })
          await res.arrayBuffer()
        } catch {
          // warm-up is best effort
        }
        return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
      },
    },
  },
})
