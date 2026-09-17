declare module 'cloudflare:workers' {
  export const env: Record<string, unknown> & {
    TYPESAFE_AI_API_KEY?: string
    AI_GATEWAY_API_KEY?: string
  }
}
