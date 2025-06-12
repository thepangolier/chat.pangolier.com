'use server'
import type { Account } from 'prisma/build'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import { generateRandomString } from '@util/hash'
import { title } from '@util/metadata'
import notificationapi from '@util/notification'
import { EMAIL_REGEX } from '@util/validation'

/**
 * Generates a one-time 2FA code, stores it on the account, and emails it to the user.
 *
 * @param account - The user account containing `id` and `email`.
 * @returns A promise resolving to a GenericResponse indicating success or failure.
 */
export async function send2FACode(account: Account): Promise<GenericResponse> {
  try {
    const code = generateRandomString()

    await prisma.account.update({
      where: { id: account.id },
      data: { emailCode: code }
    })

    await notificationapi.send({
      type: '2FA',
      email: {
        subject: `${title} | 2FA Code`,
        html: `Your 2FA code is: ${code}`,
        previewText: `Your 2FA code is: ${code}`,
        senderName: title,
        senderEmail: 'hello@pangolier.com'
      },
      user: {
        id: String(account.id),
        email: account.email
      }
    })

    return { ok: true, message: 'Sent 2FA code' }
  } catch (error) {
    console.error('Error sending 2FA code:', error)
    return { ok: false, message: 'Failed to send 2FA code' }
  }
}

/**
 * Sends a verification code to a new email address for updating the user's contact.
 *
 * @param account     - The user account initiating the update.
 * @param targetEmail - The new email address to verify.
 * @param code        - The verification code to send.
 * @returns A promise resolving to a GenericResponse indicating success or failure.
 */
export async function sendEmailUpdateCode(
  account: Account,
  targetEmail: string,
  code: string
): Promise<GenericResponse> {
  if (!targetEmail || !EMAIL_REGEX.test(targetEmail)) {
    return { ok: false, message: 'Invalid target email address' }
  }
  if (!code.trim()) {
    return { ok: false, message: 'Verification code is required' }
  }

  try {
    await notificationapi.send({
      type: 'EmailUpdate',
      email: {
        subject: `${title} | Update Email Request`,
        html: `Your code to update your email is: ${code}`,
        previewText: `Your code to update your email is: ${code}`,
        senderName: title,
        senderEmail: 'hello@pangolier.com'
      },
      user: {
        id: String(account.id),
        email: targetEmail
      }
    })

    return { ok: true, message: 'Sent email update code' }
  } catch (error) {
    console.error('Error sending email update code:', error)
    return { ok: false, message: 'Failed to send email update code' }
  }
}
