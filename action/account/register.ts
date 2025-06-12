'use server'
import prisma from 'prisma/client'
import { hashPassword } from '@action/account/util/password'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'
import { validatePassword } from '@util/validation'

/**
 * Properties required to register a new user.
 *
 * @property email            - The user's email address.
 * @property password         - The user's chosen plaintext password.
 * @property confirmPassword  - Confirmation of the chosen password.
 */
export interface RegisterProps {
  /** The user's email address. */
  email: string
  /** The user's chosen plaintext password. */
  password: string
  /** Confirmation of the chosen password. */
  confirmPassword: string
}

/**
 * Registers a new user by validating inputs, hashing their password,
 * creating an account record, and establishing a session.
 *
 * @param props.email           - The user's email address.
 * @param props.password        - The user's chosen plaintext password.
 * @param props.confirmPassword - Confirmation of the chosen password.
 * @returns A promise resolving to a GenericResponse:
 *   - `ok: true` and a success message when registration completes,
 *   - `ok: false` and an error message on any validation or persistence failure.
 */
export default async function registerAction({
  email,
  password,
  confirmPassword
}: RegisterProps): Promise<GenericResponse> {
  try {
    // Basic input validation
    if (!email || !password || !confirmPassword) {
      return {
        ok: false,
        message: 'Email, password, and confirmation are required'
      }
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      return { ok: false, message: 'Passwords do not match' }
    }

    // Validate password strength
    const { valid, message } = validatePassword(password)
    if (!valid) {
      return { ok: false, message: message! }
    }

    // Check for existing account
    const existing = await prisma.account.findUnique({ where: { email } })
    if (existing) {
      return { ok: false, message: 'An account with this email already exists' }
    }

    // Hash and store the new password
    const hashed = await hashPassword(password)
    const account = await prisma.account.create({
      data: { email, password: hashed }
    })

    // Create session for the new user
    const session = await getSession()
    session.account = account
    await session.save()

    return { ok: true, message: 'User registered successfully' }
  } catch (error) {
    console.error('Error registering user:', error)
    return { ok: false, message: 'Failed to register user' }
  }
}
