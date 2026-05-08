// Vercel serverless function for Anthropic API calls
// All Claude calls are routed through here — the API key is never exposed to the client

// NOTE: This file is structured for Vercel serverless deployment.
// During local dev, requests to /api/claude are proxied by Vite (see vite.config.ts).
// For now, this serves as the reference implementation.

export interface ClaudeAPIRequest {
  prompt: string
  childId: string
  endpoint: string
}

export interface ClaudeAPIResponse {
  content: string
  inputTokens: number
  outputTokens: number
}

// This would be the Vercel function handler:
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   if (req.method !== 'POST') return res.status(405).end()
//
//   const { prompt, childId, endpoint } = req.body as ClaudeAPIRequest
//   const apiKey = process.env.ANTHROPIC_API_KEY
//   if (!apiKey) return res.status(500).json({ error: 'API key not configured' })
//
//   const response = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01',
//     },
//     body: JSON.stringify({
//       model: 'claude-sonnet-4-20250514',
//       max_tokens: 4096,
//       messages: [{ role: 'user', content: prompt }],
//     }),
//   })
//
//   const data = await response.json()
//   const content = data.content[0].text
//   const inputTokens = data.usage.input_tokens
//   const outputTokens = data.usage.output_tokens
//
//   // Log usage
//   // await supabase.from('usage_logs').insert(...)
//
//   return res.json({ content, inputTokens, outputTokens })
// }
