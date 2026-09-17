// Request guards for the public API routes: same-origin check, body size cap,
// and a small per-IP rate limit. The limiter lives in isolate memory, so it is
// a speed bump against naive loops rather than a hard quota; TypeSafe's own
// limits and the Whop/Cloudflare edge sit behind it.

const MAX_BODY_BYTES = 16 * 1024
const WINDOW_MS = 10_000
const MAX_PER_WINDOW = 40

const buckets = new Map<string, { count: number; reset: number }>()

export const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store', ...SECURITY_HEADERS, ...extra },
  })
}

/** Returns a Response to send immediately, or null if the request may proceed. */
export async function guard(request: Request): Promise<Response | null> {
  const url = new URL(request.url)

  // Browsers mark fetches from the page itself; block cross-site and most scripted callers.
  const site = request.headers.get('sec-fetch-site')
  const origin = request.headers.get('origin')
  const sameOrigin = site === 'same-origin' || site === 'none' || (origin != null && origin === url.origin)
  if (!sameOrigin) return json({ error: 'This endpoint only serves the page it belongs to.' }, 403)

  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) return json({ error: 'Request body too large.' }, 413)

  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'

  // Per-isolate memory bucket: a speed bump, not a hard quota.
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS })
  } else if (++b.count > MAX_PER_WINDOW) {
    return json({ error: 'Slow down a little.' }, 429, { 'retry-after': String(Math.ceil((b.reset - now) / 1000)) })
  }
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k)
  }
  return null
}

export const methodNotAllowed = (allow: string) =>
  json({ error: `Use ${allow}.` }, 405, { allow })
