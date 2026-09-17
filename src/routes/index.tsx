import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SECURITY_HEADERS } from '../guard'
import { EMOJI_BY_KEY, MOOD_LEVELS, PROMPTS, PROMPTS_SHOWN, SIZES, URGENCY_LEVELS, emojiSet, pickPrompts, type ReactResponse, type Size } from '../emoji'

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
        <button className="shuffle" onClick={() => setPrompts(pickPrompts())} aria-label="Show different suggestions" title="Show different suggestions">
          ↻ shuffle
        </button>
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
          <div className="panel">
            <div className="rowhead">
              <span>MOOD</span>
              <span>{result ? MOOD_LEVELS[Math.round(result.mood.score)] : '—'}</span>
            </div>
            <div className="mood">
              <i style={{ left: `${result ? (result.mood.score / (MOOD_LEVELS.length - 1)) * 100 : 50}%` }} />
            </div>
            <div className="moodlabels">
              <span>{MOOD_LEVELS[0]}</span>
              <span>{MOOD_LEVELS[MOOD_LEVELS.length - 1]}</span>
            </div>
          </div>
          <div className="panel">
            <div className="rowhead">
              <span>URGENCY</span>
              <span>{result ? URGENCY_LEVELS[Math.round(result.urgency.score)] : '—'}</span>
            </div>
            <div className="mood urgency">
              <i style={{ left: `${result ? (result.urgency.score / (URGENCY_LEVELS.length - 1)) * 100 : 0}%` }} />
            </div>
            <div className="moodlabels">
              <span>{URGENCY_LEVELS[0]}</span>
              <span>{URGENCY_LEVELS[URGENCY_LEVELS.length - 1]}</span>
            </div>
          </div>
          <div className="panel">
            <div className="rowhead">
              <span>SARCASM</span>
              <span>{result ? result.sarcasm.toFixed(2) : '—'}</span>
            </div>
            <span className="bar rose" style={{ display: 'block', height: '0.75rem' }}>
              <i style={{ width: `${result ? result.sarcasm * 100 : 0}%` }} />
            </span>
          </div>
          <div className="panel">
            <div className="rowhead">
              <span>JOKE</span>
              <span>{result ? result.joke.toFixed(2) : '—'}</span>
            </div>
            <span className="bar amber" style={{ display: 'block', height: '0.75rem' }}>
              <i style={{ width: `${result ? result.joke * 100 : 0}%` }} />
            </span>
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

const CLONE_CMD = 'whop apps init --template app_D0f07WnZVO8v5N --app_type website'

function CloneButton() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLONE_CMD)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this command:', CLONE_CMD)
    }
  }
  return (
    <button className="clone" onClick={copy} title={CLONE_CMD} aria-label="Copy the Whop CLI command to clone this app">
      {copied ? '✓ command copied' : '⧉ clone with the Whop CLI'}
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
      <button className={theme === 'light' ? 'on' : undefined} onClick={() => choose('light')} aria-pressed={theme === 'light'} title="Light">
        ☀
      </button>
      <button className={theme === 'dark' ? 'on' : undefined} onClick={() => choose('dark')} aria-pressed={theme === 'dark'} title="Dark">
        ☾
      </button>
    </span>
  )
}
