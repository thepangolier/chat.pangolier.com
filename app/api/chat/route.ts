import { type CoreMessage, type JSONValue, smoothStream, streamText } from 'ai'
import persistAssistantMessage from '@ai/persist'
import getProvider, { type ProviderName } from '@ai/provider'
import { guardFreeQuota } from '@ai/quota'
import { type GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import getSession from '@util/session'
import { supportsReasoning } from '@util/support'

/**
 * Shape of the request body for the chat endpoint.
 */
export interface ChatBody {
  /** Thread to associate the assistant response with */
  threadId?: string
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

export type LanguageModelV1ProviderMetadata = Record<
  string,
  Record<string, JSONValue>
>

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
  const { account } = await getSession()
  if (!account) {
    return new Response('Unauthorized', { status: 401 })
  }

  const quotaResponse = await guardFreeQuota(account!.id, threadId)
  if (quotaResponse) return quotaResponse

  const providerOptions: LanguageModelV1ProviderMetadata = {}

  if (
    (provider === 'xai' || provider === undefined) &&
    supportsReasoning('xai', model)
  ) {
    providerOptions.xai = { reasoningEffort: reasoning }
  }

  if (provider === 'openai' && supportsReasoning('openai', model)) {
    providerOptions.openai = {
      reasoningEffort: reasoning,
      reasoningSummary: 'auto'
    }
  }

  if (provider === 'gemini' && supportsReasoning('gemini', model)) {
    providerOptions.google = {
      thinkingConfig: {
        thinkingBudget:
          reasoning === 'high' ? 2048 : reasoning === 'medium' ? 1024 : 512,
        includeThoughts: true
      }
    } satisfies GoogleGenerativeAIProviderOptions
  }

  const result = streamText({
    system: '',
    model: getProvider({ provider, model, useSearchGrounding }),
    providerOptions,
    messages,
    experimental_transform: smoothStream({ delayInMs: 25, chunking: 'word' }),
    async onFinish({ text, reasoning }) {
      console.log('Chat Stream Finish', text, reasoning)
      await persistAssistantMessage(threadId!, text, reasoning)
    },
    onError({ error }) {
      console.error('Chat Stream Error', error)
    }
  })

  return result.toDataStreamResponse({ sendReasoning: true })
}
