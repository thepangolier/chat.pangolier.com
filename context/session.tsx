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

/*
 * Value exposed by the session context.
 *
 * @property account   - The authenticated account (never `null`).
 * @property setAccount - Setter to overwrite the current account.
 */
export interface SessionContextValue {
  account: Account
  setAccount: Dispatch<SetStateAction<Account>>
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

  const value = useMemo(() => ({ account, setAccount }), [account, setAccount])

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
