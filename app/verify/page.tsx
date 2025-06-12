import '@scss/app/login.scss'
import type { Metadata } from 'next'
import VerifyForm from '@component/verify'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Verify`,
  description: `Verify your account for an ${title} web application`
}

export default function VerifyPage() {
  return (
    <div id="verify">
      <VerifyForm />
    </div>
  )
}
