import '@scss/generic/switch.scss'

export interface SwitchProps {
  disabled?: boolean
  on: boolean
  setOn(v: boolean): void
}

export default function Switch({ disabled = false, on, setOn }: SwitchProps) {
  return (
    <button
      disabled={disabled}
      className={`switch ${on ? 'switch-on' : 'switch-off'}`}
      onClick={() => setOn(!on)}
    >
      <div className="switch-ball" />
    </button>
  )
}
