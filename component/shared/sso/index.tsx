export type SSOAction = 'login' | 'connect' | 'disconnect'

export interface SSOProps {
  loading?: boolean
  text: string
  action: SSOAction
  onSuccess(): void
}
