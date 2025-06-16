'use client'
import type { Account } from 'prisma/build'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState
} from 'react'
import { type ProviderName } from '@ai/provider'

export interface ModelSelection {
  provider: ProviderName
  model: string
}

/*
 * Value exposed by the session context.
 *
 * @property account          - The authenticated account (never `null`).
 * @property setAccount       - Setter to overwrite the current account.
 * @property historyPopup     - Whether the conversation history pop-up is visible.
 * @property setHistoryPopup  - Setter to toggle the history pop-up visibility.
 * @property model            - The currently selected model.
 * @property setModel         - Setter to overwrite the current model.
 */
export interface SessionContextValue {
  account: Account
  setAccount: Dispatch<SetStateAction<Account>>
  historyPopup: boolean
  setHistoryPopup: Dispatch<SetStateAction<boolean>>
  model: ModelSelection
  setModel: Dispatch<SetStateAction<ModelSelection>>
  reasoning: 'low' | 'medium' | 'high'
  setReasoning: Dispatch<SetStateAction<'low' | 'medium' | 'high'>>
  useSearchGrounding: boolean
  setUseSearchGrounding: Dispatch<SetStateAction<boolean>>
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

/*
 * Props accepted by {@link SessionProvider}.
 *
 * @property children       - Descendant React nodes.
 * @property initialAccount - The server-fetched account (must be non-null).
 */
export interface SessionProviderProps {
  children: ReactNode
  initialAccount: Account
}

/*
 * Makes a non-nullable {@link Account} available to the component tree.
 *
 * Components that call {@link useSession} can rely on `account` always
 * being defined.
 *
 * @param children       - Descendant React nodes.
 * @param initialAccount - Hydrated account from the server.
 */
export function SessionProvider({
  children,
  initialAccount
}: SessionProviderProps) {
  const [account, setAccount] = useState<Account>(initialAccount)
  const [historyPopup, setHistoryPopup] = useState<boolean>(false)
  const [model, setModel] = useState<ModelSelection>({
    provider: 'xai',
    model: 'grok-3-mini'
  })
  const [reasoning, setReasoning] = useState<'low' | 'medium' | 'high'>('low')
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false)

  const value = useMemo(
    () => ({
      account,
      setAccount,
      historyPopup,
      setHistoryPopup,
      model,
      setModel,
      reasoning,
      setReasoning,
      useSearchGrounding,
      setUseSearchGrounding
    }),
    [
      account,
      setAccount,
      historyPopup,
      setHistoryPopup,
      model,
      setModel,
      reasoning,
      setReasoning,
      useSearchGrounding,
      setUseSearchGrounding
    ]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

/*
 * Hook that returns the guaranteed-present session context.
 *
 * @throws Error if used outside of a {@link SessionProvider}.
 * @returns The current {@link SessionContextValue}.
 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return ctx
}
