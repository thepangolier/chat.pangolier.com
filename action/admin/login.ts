'use server'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

// Configurable admin credentials
// These environment variables define the valid admin email and password.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

/**
 * Properties required to perform an admin login.
 *
 * @property email    - The administrator's email address.
 * @property password - The administrator's plain text password.
 */
export interface AdminLoginProps {
  email: string
  password: string
}

/**
 * Authenticates an administrator by verifying provided credentials against configured values.
 * On successful authentication, the session is marked with admin privileges.
 *
 * @param props        - Object containing the admin's login credentials.
 * @param props.email  - The administrator's email address to verify.
 * @param props.password - The administrator's password to verify.
 * @returns A promise resolving to a GenericResponse that indicates whether authentication succeeded.
 */
export default async function adminLoginAction({
  email,
  password
}: AdminLoginProps): Promise<GenericResponse> {
  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session = await getSession()
      session.admin = true
      await session.save()

      return { ok: true, message: 'Admin logged in successfully' }
    }

    return { ok: false, message: 'Invalid credentials' }
  } catch (error) {
    console.error('Error logging in admin:', error)
    return { ok: false, message: 'Failed to log in admin' }
  }
}
