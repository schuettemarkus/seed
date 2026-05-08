import { supabase } from './supabase'

export async function logUsage(params: {
  parentId: string
  childId: string
  endpoint: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}) {
  const { error } = await supabase.from('usage_logs').insert({
    parent_id: params.parentId,
    child_id: params.childId,
    endpoint: params.endpoint,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    cost_usd: params.costUsd,
  })
  if (error) console.error('Failed to log usage:', error)
}
