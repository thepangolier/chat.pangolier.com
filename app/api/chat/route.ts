import { type CoreMessage, smoothStream, streamText } from 'ai'
import buildProviderOptions from '@ai/options'
import persistAssistantMessage from '@ai/persist'
import getProvider, { type ProviderName } from '@ai/provider'

/**
 * Shape of the request body for the chat endpoint.
 */
export interface ChatBody {
  /** Thread to associate the assistant response with */
  threadId?: number
  /** Array of messages to send to the AI provider. */
  messages: CoreMessage[]
  /** Optional provider to use (defaults to 'xai'). */
  provider?: ProviderName
  /** Optional model name to pass to the provider. */
  model?: string
  /** Reasoning effort for applicable providers ('low' | 'medium' | 'high'). */
  reasoning?: 'low' | 'medium' | 'high'
  /** Enable Google Search Grounding for Gemini models. */
  useSearchGrounding?: boolean
}

/**
 * Handles POST requests to the chat API route by streaming AI-generated responses.
 * The request body must conform to {@link ChatBody}. Uses smoothStream to chunk output by word,
 * and includes reasoning when sending the response stream.
 *
 * @param req - The incoming request containing a JSON body of chat messages.
 * @returns A streamed response with AI-generated text and reasoning data.
 */
export async function POST(req: Request) {
  const {
    threadId,
    messages,
    provider = 'xai',
    model,
    reasoning = 'low',
    useSearchGrounding = false
  } = (await req.json()) as ChatBody

  const result = streamText({
    system: '',
    model: getProvider({ provider, model, useSearchGrounding }),
    providerOptions: buildProviderOptions({ provider, model, reasoning }),
    messages,
    experimental_transform: smoothStream({ chunking: 'word' }),
    onError({ error }) {
      console.error('Chat Stream Error', error)
    }
  })

  if (threadId) {
    /* The helper runs completely independently from the HTTP response */
    persistAssistantMessage(result.text, threadId).catch((err) =>
      console.error('Failed to persist assistant response', err)
    )
  }

  return result.toDataStreamResponse({ sendReasoning: true })
}
