import '@scss/app/login.scss'
import type { Metadata } from 'next'
import AdminLoginForm from '@component/admin/login'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Admin Login`,
  description: `Login to the admin of an ${title} web application`
}

export default function LoginPage() {
  return (
    <div id="login">
      <AdminLoginForm />
    </div>
  )
}
