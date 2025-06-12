import { type CoreMessage, smoothStream, streamText } from 'ai'
import getProvider from '@ai/provider'
import system from '@ai/system'

/**
 * Maximum duration in seconds for streaming a chat response.
 */
export const maxDuration = 60

/**
 * Shape of the request body for the chat endpoint.
 */
export interface ChatBody {
  /** Array of messages to send to the AI provider. */
  messages: CoreMessage[]
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
  const { messages } = (await req.json()) as ChatBody

  const result = streamText({
    system,
    model: getProvider(),
    providerOptions: {
      xai: { reasoningEffort: 'low' }
    },
    messages,
    experimental_transform: smoothStream({ chunking: 'word' }),
    onError({ error }) {
      console.error('Chat Stream Error', error)
    }
  })

  return result.toDataStreamResponse({ sendReasoning: true })
}
