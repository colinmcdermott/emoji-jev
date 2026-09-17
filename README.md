# Emoji Jev

**Emoji autocomplete at the speed of typing.** Live at [emoji-jev.whop.site](https://emoji-jev.whop.site).

Type anything and a keyboard of up to 254 emojis lights up as you go. Every pause in typing is one call to [Jev](https://typesafe.ai), which answers eight typed questions in parallel in about 100 ms of model time:

- a **Choice** over 64, 128, or 254 emojis (switchable on the page), with a probability for every key
- a **Choice** over eight primary emotions, shown as a distribution
- three **Scores**: mood, urgency, and energy
- three **Booleans**: sarcasm, joke, and whether the writer wants a reply

Jev bills input tokens only, so a keystroke costs about $0.0002.

## Stack

- [TanStack Start](https://tanstack.com/start) on Cloudflare Workers, hosted by [Whop](https://whop.com) (`*.whop.site`)
- [AI SDK](https://ai-sdk.dev) `experimental_evaluate` with the [`@ai-sdk/typesafe-ai`](https://ai-sdk.dev/providers/ai-sdk-providers/typesafe-ai) provider
- No UI framework, no Tailwind: one small stylesheet and the system font

## Run it yourself

```sh
whop apps init --template app_D0f07WnZVO8v5N --app_type website   # clone the published source
cd emoji-jev
whop apps secrets set --secret TYPESAFE_AI_API_KEY=...             # key from https://console.typesafe.ai/settings/keys
echo "TYPESAFE_AI_API_KEY=..." > .dev.vars                          # same key for local dev (gitignored)
whop apps dev
whop apps deploy
```

Or from this repo: `pnpm install`, add `.dev.vars`, `pnpm dev`.

## Files

- `src/emoji.ts` the emoji vocabulary and the three questions
- `src/jev.ts` the Jev call, reads the key from the Worker env binding
- `src/routes/api/react.ts` `POST /api/react`
- `src/routes/index.tsx` the page
