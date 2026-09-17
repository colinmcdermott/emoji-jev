declare module 'cloudflare:workers' {
  export const env: Record<string, unknown> & {
    TYPESAFE_AI_API_KEY?: string
    RATE_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> }
  }
}
