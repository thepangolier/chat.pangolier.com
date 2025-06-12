'use server'
import prisma from 'prisma/client'
import { sendEmailUpdateCode } from '@action/notification'
import type { GenericResponse } from '@action/types'
import { generateRandomString } from '@util/hash'
import getSession from '@util/session'

/**
 * Properties for sending an email update code.
 */
export interface SendCodeProps {
  /** The target email address to send the update code to. */
  email: string
}

/**
 * Sends an email update code to the specified email for the authenticated account.
 * The account's `targetEmail` and `targetCode` fields are updated and persisted,
 * and the session is refreshed with the new account data before dispatching the email.
 *
 * @param props - Object containing the new email address.
 * @param props.email - The email address where the update code will be sent.
 * @returns A promise resolving to a {@link GenericResponse} indicating success or failure.
 */
export default async function sendCodeAction({
  email
}: SendCodeProps): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const code = generateRandomString()

    const account = await prisma.account.update({
      where: { id: accountId },
      data: { targetEmail: email, targetCode: code }
    })

    session.account = account
    await session.save()

    await sendEmailUpdateCode(account, email, code)

    return { ok: true, message: 'Email update code sent successfully' }
  } catch (error) {
    console.error('Error sending email update code:', error)
    return { ok: false, message: 'Failed to send email update code' }
  }
}
