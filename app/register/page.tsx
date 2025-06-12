import '@scss/app/login.scss'
import type { Metadata } from 'next'
import RegisterForm from '@component/register'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Register`,
  description: `Register for an ${title} web application`
}

export default function RegisterPage() {
  return (
    <div id="register">
      <RegisterForm />
    </div>
  )
}
