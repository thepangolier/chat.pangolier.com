'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Payload for updating the authenticated user's notification preferences.
 *
 * @property notifyAll - When true, the user will receive all notifications (overrides other settings).
 * @property notifyUpdates - When true, the user will receive update notifications.
 * @property notifyDeals - When true, the user will receive deal notifications.
 */
export interface UpdateNotificationsRequest {
  /** Notify for all events. */
  notifyAll?: boolean
  /** Notify for updates. */
  notifyUpdates?: boolean
  /** Notify for deals. */
  notifyDeals?: boolean
}

/**
 * Updates the notification preferences for the current session's account.
 *
 * @param data - The notification settings to update.
 * @returns A promise resolving to a {@link GenericResponse} indicating the outcome.
 */
export async function updateNotificationsAction(
  data: UpdateNotificationsRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const updateData: Partial<UpdateNotificationsRequest> = {}

    if (data.notifyAll !== undefined) updateData.notifyAll = data.notifyAll
    if (data.notifyUpdates !== undefined)
      updateData.notifyUpdates = data.notifyUpdates
    if (data.notifyDeals !== undefined)
      updateData.notifyDeals = data.notifyDeals

    if (Object.keys(updateData).length === 0) {
      return { ok: false, message: 'No fields to update' }
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData
    })

    session.account = account
    await session.save()

    return {
      ok: true,
      message: 'Notification preferences updated successfully'
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return {
      ok: false,
      message: 'Failed to update notification preferences'
    }
  }
}
