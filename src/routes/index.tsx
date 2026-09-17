import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SECURITY_HEADERS } from '../guard'
import { EMOJI_BY_KEY, EMOTIONS, ENERGY_LEVELS, MOOD_LEVELS, PROMPTS, PROMPTS_SHOWN, SIZES, URGENCY_LEVELS, emojiSet, pickPrompts, type ReactResponse, type Size } from '../emoji'

export const Route = createFileRoute('/')({
  component: Home,
  // The document is identical for everyone until they type, so let Cloudflare's
  // edge serve it. Short TTL: a deploy replaces the hashed assets immediately.
  headers: () => ({
    'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=60',
    ...SECURITY_HEADERS,
  }),
})

type Status = 'idle' | 'loading' | 'ok' | 'error'
const DEBOUNCE_MS = 220

function Home() {
  const [text, setText] = useState('')
  const [size, setSize] = useState<Size>('full')
  // Deterministic on the server so hydration matches; shuffled once mounted.
  const [prompts, setPrompts] = useState<string[]>(() => PROMPTS.slice(0, PROMPTS_SHOWN))
  const [result, setResult] = useState<ReactResponse | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState({ calls: 0, cost: 0, ms: [] as number[] })
  const [clientMs, setClientMs] = useState<number | null>(null)
  const seq = useRef(0)
  const lastWarm = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const run = useCallback(async (value: string, sz: Size) => {
    const id = ++seq.current
    if (!value.trim()) {
      setResult(null)
      setStatus('idle')
      return
    }
    setStatus('loading')
    const t0 = performance.now()
    try {
      const res = await fetch('/api/react', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: value, size: sz }),
      })
      const body = (await res.json()) as ReactResponse & { error?: string }
      if (id !== seq.current) return
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      const r = body
      setClientMs(performance.now() - t0)
      setResult(r)
      setStatus('ok')
      setError(null)
      setSession((s) => ({ calls: s.calls + 1, cost: s.cost + r.costUsd, ms: [...s.ms.slice(-49), r.timing.modelMs ?? r.timing.serverMs] }))
    } catch (e) {
      if (id !== seq.current) return
      setStatus('error')
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => run(text, size), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [text, size, run])

  // Keep the Worker's connection to TypeSafe open so a keystroke doesn't pay a handshake.
  const warm = useCallback(() => {
    const now = Date.now()
    if (now - lastWarm.current < 20_000) return
    lastWarm.current = now
    fetch('/api/warm').catch(() => {})
  }, [])

  useEffect(() => {
    setPrompts(pickPrompts())
    inputRef.current?.focus()
    warm()
    const t = setInterval(warm, 25_000)
    return () => clearInterval(t)
  }, [warm])

  const probs = useMemo(() => result?.emoji.probabilities ?? {}, [result])
  const top = useMemo(
    () =>
      Object.entries(probs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, p]) => ({ ...EMOJI_BY_KEY[key], p })),
    [probs],
  )
  const winner = result ? EMOJI_BY_KEY[result.emoji.choice] : null
  const keys = useMemo(() => emojiSet(size), [size])
  const maxP = top[0]?.p ?? 1
  const medianMs = useMemo(() => {
    if (!session.ms.length) return null
    const s = [...session.ms].sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)]
  }, [session.ms])

  return (
    <main>
      <div className="brandrow">
        <span className="brand">⌨️ Emoji Jev</span>
        <span className="brandsub">Emoji autocomplete at the speed of typing.</span>
        <span className="pills">
          <span className="pill">{keys.length} emojis</span>
          <span className="pill accent">{result?.modelId ?? 'jev-latest'}</span>
          <ThemeToggle />
        </span>
      </div>

      <div className="panel inputrow">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={warm}
          placeholder="type anything…"
          autoComplete="off"
          spellCheck={false}
          aria-label="Your message"
        />
        <div
          key={winner?.key ?? 'none'}
          className={winner ? 'hero' : 'hero empty'}
          aria-live="polite"
          aria-label={winner ? `Suggested emoji: ${winner.key}` : 'No suggestion yet'}
        >
          {winner ? winner.char : '·'}
        </div>
      </div>

      <div className="chips">
        <button className="shuffle" onClick={() => setPrompts(pickPrompts())} aria-label="Show different suggestions" title="Show different suggestions">
          ↻
        </button>
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => {
              setText(p)
              inputRef.current?.focus()
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="stats" aria-live="polite">
        <Stat
          label="Model time"
          value={result ? `${Math.round(result.timing.modelMs ?? result.timing.serverMs)} ms` : '—'}
          hint="Jev's own processing time, as reported by TypeSafe"
        />
        <Stat
          label="Round trip"
          value={clientMs != null && result ? `${Math.round(clientMs)} ms` : '—'}
          hint="keystroke to answer, including the network hops to Oregon and back"
        />
        <Stat label="Input tokens" value={result ? result.usage.inputTokens.toLocaleString() : '—'} hint={`your text plus the ${keys.length} options and their descriptions; output tokens are free`} />
        <Stat label="Cost" value={result ? `$${result.costUsd.toFixed(5)}` : '—'} hint="this call, at $0.042 per million" />
        <Stat label="Options" value={keys.length.toLocaleString()} hint="emojis chosen between in one Choice question, plus four side questions" />
        <Stat
          label="Session"
          value={medianMs != null ? `${Math.round(medianMs)} ms` : '—'}
          hint={session.calls ? `median model time over ${session.calls} calls · $${session.cost.toFixed(4)} total` : 'median model time'}
        />
      </div>
      <p className={`status ${status}`}>
        <span className={`dot ${status}`} />
        {status === 'error' ? error : status === 'loading' ? 'thinking…' : result ? `${result.modelId ?? 'jev'} answered` : 'waiting for input'}
      </p>

      <div className="grid2">
        <div className="panel">
          <div className="rowhead">
            <span>TOP PICKS</span>
          </div>
          {top.length ? (
            <ul className="top">
              {top.map((e) => (
                <li key={e.key}>
                  <span className="e">{e.char}</span>
                  <span className="bar">
                    <i style={{ width: `${Math.max(2, (e.p / maxP) * 100)}%` }} />
                  </span>
                  <span className="k">{e.key}</span>
                  <span className="p">{e.p.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Start typing and the picks appear here.</p>
          )}
        </div>

        <div className="gauges">
          <Slider label="Mood" levels={MOOD_LEVELS} score={result?.mood.score} cls="mood" />
          <Slider label="Urgency" levels={URGENCY_LEVELS} score={result?.urgency.score} cls="mood urgency" />
          <Slider label="Energy" levels={ENERGY_LEVELS} score={result?.energy.score} cls="mood energy" />
          <Gauge label="Wants a reply" value={result?.wantsReply} cls="sky" />
          <Gauge label="Sarcasm" value={result?.sarcasm} cls="rose" />
          <Gauge label="Joke" value={result?.joke} cls="amber" />
          <div className="panel wide">
            <div className="rowhead">
              <span>PRIMARY EMOTION</span>
              <span>{result ? result.emotion.choice : '—'}</span>
            </div>
            <ul className="emotions">
              {(Object.keys(EMOTIONS) as (keyof typeof EMOTIONS)[])
                .map((k) => ({ k, p: result?.emotion.probabilities[k] ?? 0 }))
                .sort((a, b) => b.p - a.p)
                .map(({ k, p }) => (
                  <li key={k} className={result?.emotion.choice === k ? 'lead' : undefined}>
                    <span className="k">{k}</span>
                    <span className="bar">
                      <i style={{ width: `${Math.max(p > 0 ? 2 : 0, p * 100)}%` }} />
                    </span>
                    <span className="p">{p.toFixed(2)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="rowhead">
          <span>{keys.length} OPTIONS · PROBABILITY LIGHTS EACH KEY</span>
          <span className="seg" role="group" aria-label="Emoji set size">
            {(Object.keys(SIZES) as Size[]).map((sz) => (
              <button key={sz} className={sz === size ? 'on' : undefined} onClick={() => setSize(sz)} aria-pressed={sz === size}>
                {SIZES[sz]}
              </button>
            ))}
          </span>
        </div>
        <div className="keys">
          {keys.map((e) => {
            const p = probs[e.key] ?? 0
            const style = result
              ? ({ '--p': 0.85 * p, '--o': 0.22 + 0.78 * Math.sqrt(p), '--s': 1 + 0.35 * Math.sqrt(p) } as React.CSSProperties)
              : undefined
            return (
              <button
                key={e.key}
                title={`${e.key} · ${p.toFixed(2)}`}
                className={result?.emoji.choice === e.key ? 'win' : undefined}
                style={style}
                onClick={() => setText((t) => (t ? `${t} ${e.char}` : e.char))}
              >
                {e.char}
              </button>
            )
          })}
        </div>
      </div>
      <footer className="foot">
        <p>
          Decisions by <a href="https://typesafe.ai" target="_blank" rel="noopener noreferrer">Jev</a> via the{' '}
          <a href="https://ai-sdk.dev/providers/ai-sdk-providers/typesafe-ai" target="_blank" rel="noopener noreferrer">AI SDK</a>. Built by{' '}
          <a href="https://x.com/ColinMcDermott" target="_blank" rel="noopener noreferrer">@ColinMcDermott</a> and deployed with the{' '}
          <a href="https://docs.whop.com/cli/overview" target="_blank" rel="noopener noreferrer">Whop CLI</a>.{' '}
          <a href="https://github.com/colinmcdermott/emoji-jev" target="_blank" rel="noopener noreferrer">View the code</a>.
        </p>
        <CloneButton />
      </footer>
    </main>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="stat" title={hint}>
      <span className="v">{value}</span>
      <span className="l">{label}</span>
    </div>
  )
}

const SETUP_PROMPT = `Set up my own copy of the Emoji Jev app (https://emoji-jev.whop.site, source: https://github.com/colinmcdermott/emoji-jev).
1. If the \`whop\` CLI is not installed, install it: npm install -g @whop/cli (or: curl -fsSL https://whop.com/install.sh | sh).
2. Run \`whop login\`, then pick or create a business when prompted.
3. Clone the published app: whop apps init --template app_D0f07WnZVO8v5N --app_type website
4. Get a TypeSafe AI API key from https://console.typesafe.ai/settings/keys and store it: whop apps secrets set --secret TYPESAFE_AI_API_KEY=<key>. Also write TYPESAFE_AI_API_KEY=<key> to a .dev.vars file in the project for local dev.
5. Run \`whop apps dev\` to try it locally, then \`whop apps deploy\` to put it live on <route>.whop.site.`

function CloneButton() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this prompt:', SETUP_PROMPT)
    }
  }
  return (
    <button className="clone" onClick={copy} title="Copies a prompt you can paste into Claude Code, Cursor, or any AI agent to install the Whop CLI and clone this app" aria-label="Copy an AI setup prompt to clone this app">
      {copied ? '✓ prompt copied, paste it into your AI agent' : '⧉ copy AI prompt to clone this app'}
    </button>
  )
}

type Theme = 'light' | 'dark'

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('theme')
    } catch {}
    if (saved === 'light' || saved === 'dark') setTheme(saved)
    else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }, [])
  const choose = (t: Theme) => {
    setTheme(t)
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem('theme', t)
    } catch {}
  }
  return (
    <span className="seg theme" role="group" aria-label="Colour theme">
      <button className={theme === 'light' ? 'on' : undefined} onClick={() => choose('light')} aria-pressed={theme === 'light'} title="Light" aria-label="Light theme">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
      <button className={theme === 'dark' ? 'on' : undefined} onClick={() => choose('dark')} aria-pressed={theme === 'dark'} title="Dark" aria-label="Dark theme">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </button>
    </span>
  )
}

function Slider({ label, levels, score, cls }: { label: string; levels: readonly string[]; score?: number; cls: string }) {
  const has = score != null
  return (
    <div className="panel">
      <div className="rowhead">
        <span>{label.toUpperCase()}</span>
        <span>{has ? levels[Math.round(score)] : '—'}</span>
      </div>
      <div className={cls}>
        <i style={{ left: `${has ? (score / (levels.length - 1)) * 100 : 0}%`, opacity: has ? 1 : 0.4 }} />
      </div>
      <div className="moodlabels">
        <span>{levels[0]}</span>
        <span>{levels[levels.length - 1]}</span>
      </div>
    </div>
  )
}

function Gauge({ label, value, cls }: { label: string; value?: number; cls: string }) {
  return (
    <div className="panel">
      <div className="rowhead">
        <span>{label.toUpperCase()}</span>
        <span>{value != null ? value.toFixed(2) : '—'}</span>
      </div>
      <span className={`bar ${cls}`} style={{ display: 'block', height: '0.75rem' }}>
        <i style={{ width: `${value != null ? value * 100 : 0}%` }} />
      </span>
    </div>
  )
}
