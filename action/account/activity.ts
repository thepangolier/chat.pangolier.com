'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/*
 * Request payload for recording an activity.
 *
 * @property type        - The type or category of the activity (e.g. "login", "purchase").
 * @property description - A human-readable description of what the activity entails.
 */
export interface ActivityRequest {
  /** Type of the activity */
  type: string
  /** Description of the activity */
  description: string
}

/*
 * Records a user activity in the database for the currently authenticated session.
 *
 * @param data - The activity request payload containing `type` and `description`.
 * @returns A Promise that resolves to a GenericResponse:
 *          - `ok: true` if the activity was recorded successfully,
 *            otherwise `ok: false`.
 *          - `message` provides context on success or failure.
 */
export async function activityAction(
  data: ActivityRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    await prisma.activity.create({
      data: {
        accountId,
        type: data.type,
        description: data.description
      }
    })

    return { ok: true, message: 'Activity recorded successfully' }
  } catch (error) {
    console.error('Error recording activity:', error)
    return { ok: false, message: 'Failed to record activity' }
  }
}
