import type { ProviderName } from '@ai/provider'

export function supportsReasoning(
  prov: ProviderName,
  modelId?: string
): boolean {
  if (!modelId) return true
  const m = modelId.toLowerCase()
  switch (prov) {
    case 'gemini':
      return m.includes('2.5-flash') || m.includes('2.5-pro')
    case 'xai':
      return m.includes('grok-3-mini')
    case 'openai':
      return m === 'o3' || m.includes('o4-mini')
    default:
      return false
  }
}

export function supportsSearch(prov: ProviderName) {
  return prov === 'gemini'
}
