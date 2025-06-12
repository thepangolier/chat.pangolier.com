'use server'
import prisma from 'prisma/client'
import { EMAIL_REGEX } from '@util/validation'

/**
 * The shape of the response returned by `validateEmailAction`.
 */
export interface ValidateEmailResponse {
  /**
   * `true` if the email passed all validation checks and is not in use.
   */
  valid: boolean

  /**
   * Human-readable message describing the validation result or error.
   */
  message?: string

  /**
   * `true` if the email does _not_ already exist in the database.
   */
  available?: boolean
}

/**
 * Validates an email address string for both format and uniqueness.
 *
 * This function performs the following checks:
 * 1. Ensures a non-empty value is provided.
 * 2. Tests the value against a standard email regex.
 * 3. Queries the database to confirm the email isn’t already registered.
 *
 * @param email - The email address to validate.
 * @returns A promise resolving to a {@link ValidateEmailResponse} object:
 *   - `valid`: overall pass/fail of both format and uniqueness checks.
 *   - `message`: guidance or error details for the caller.
 *   - `available`: specifically indicates database availability.
 */
export default async function validateEmailAction(
  email: string
): Promise<ValidateEmailResponse> {
  if (!email) {
    return {
      valid: false,
      message: 'Email is required',
      available: false
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      message: 'Please enter a valid email address',
      available: false
    }
  }

  try {
    const existingAccount = await prisma.account.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingAccount) {
      return {
        valid: false,
        message: 'Email is already in use',
        available: false
      }
    }

    return {
      valid: true,
      message: 'Email is available',
      available: true
    }
  } catch (error) {
    console.error('Error validating email:', error)
    return {
      valid: false,
      message: 'Error validating email',
      available: false
    }
  }
}
