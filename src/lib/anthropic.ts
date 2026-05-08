// Client-side wrapper for calling the /api/claude serverless function
// All Anthropic API calls go through the server — never expose the key to the client

interface ClaudeRequest {
  prompt: string
  childId: string
  endpoint: string
}

interface ClaudeResponse {
  content: string
  inputTokens: number
  outputTokens: number
}

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  return response.json()
}
