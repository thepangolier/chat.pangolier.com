'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Payload for updating a user's profile.
 *
 * @property photo   - Optional URL of the new profile photo.
 * @property banner  - Optional URL of the new banner image.
 * @property name    - Optional display name for the profile.
 * @property bio     - Optional biography text.
 */
export interface UpdateProfileRequest {
  photo?: string
  banner?: string
  name?: string
  bio?: string
}

/**
 * Updates the authenticated user's profile fields in the database.
 *
 * @param data - An object containing one or more profile fields to update.
 * @returns A {@link GenericResponse} indicating whether the update succeeded,
 *          along with a descriptive message.
 */
export async function updateProfileAction(
  data: UpdateProfileRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const updateData: Partial<UpdateProfileRequest> = {}

    if (data.photo !== undefined) updateData.photo = data.photo
    if (data.banner !== undefined) updateData.banner = data.banner
    if (data.name !== undefined) updateData.name = data.name
    if (data.bio !== undefined) updateData.bio = data.bio

    if (Object.keys(updateData).length === 0) {
      return { ok: false, message: 'No fields to update' }
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData
    })

    session.account = account
    await session.save()

    return { ok: true, message: 'Profile updated successfully' }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { ok: false, message: 'Failed to update profile' }
  }
}
