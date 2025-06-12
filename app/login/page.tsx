import '@scss/app/login.scss'
import type { Metadata } from 'next'
import LoginForm from '@component/login'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Login`,
  description: `Login to an ${title} web application`
}

export default function LoginPage() {
  return (
    <div id="login">
      <LoginForm />
    </div>
  )
}
