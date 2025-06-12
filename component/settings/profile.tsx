'use client'
import '@scss/app/profile.scss'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { updateProfileAction } from '@action/account/update/profile'
import { IconPhoto } from '@component/shared/icon'
import Image from '@component/shared/image'
import UploadDropzone from '@component/shared/upload'
import { useSession } from '@context/session'

export default function ProfileSettings() {
  const { account, setAccount } = useSession()
  const [photo, setPhoto] = useState(account?.photo ?? '')
  const [banner, setBanner] = useState(account?.banner ?? '')
  const [name, setName] = useState(account?.name ?? '')
  const [bio, setBio] = useState(account?.bio ?? '')

  const hasChanges = useMemo(() => {
    if (!account) return false
    return (
      photo !== (account.photo || '') ||
      banner !== (account.banner || '') ||
      name !== (account.name || '') ||
      bio !== (account.bio || '')
    )
  }, [photo, banner, name, bio, account])

  return (
    <div className="settings-content">
      <div className="profile">
        <button
          className="profile-submit"
          style={{ opacity: hasChanges ? 1 : 0 }}
          onClick={async () => {
            try {
              const payload = await updateProfileAction({
                photo,
                banner,
                name,
                bio
              })
              if (payload.ok) {
                toast.success(payload.message)
                setAccount({
                  ...account!,
                  photo,
                  banner,
                  name,
                  bio
                })
              } else {
                toast.error(payload.message)
              }
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred'
              toast.error(message)
            }
          }}
        >
          Save Changes
        </button>
        <div className="profile-banner">
          <div className="profile-banner-image">
            {banner && <Image s3Key={banner} fill={true} alt="Banner Photo" />}
            <UploadDropzone
              label={<IconPhoto />}
              prefix={String(account?.id)}
              setUrl={async (v) => {
                setBanner(v)
                const payload = await updateProfileAction({ banner: v })
                if (payload.ok) {
                  toast.success(payload.message)
                  setAccount({
                    ...account!,
                    banner: v
                  })
                } else {
                  toast.error(payload.message)
                }
              }}
              aspect={16 / 9}
            />
          </div>
          <div className="profile-banner-photo">
            {photo && <Image s3Key={photo} fill={true} alt="Profile Photo" />}
            <UploadDropzone
              label={<IconPhoto />}
              prefix={String(account?.id)}
              setUrl={async (v) => {
                setPhoto(v)
                const payload = await updateProfileAction({ photo: v })
                if (payload.ok) {
                  toast.success(payload.message)
                  setAccount({
                    ...account!,
                    photo: v
                  })
                } else {
                  toast.error(payload.message)
                }
              }}
            />
          </div>
        </div>
        <div className="profile-bio">
          <div className="profile-bio-name">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="profile-bio-description">
            <textarea
              placeholder="Write a brief description of yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
