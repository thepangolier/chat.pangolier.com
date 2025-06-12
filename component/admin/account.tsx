'use client'
import '@scss/admin/form.scss'
import Link from 'next/link'
import type { Account } from 'prisma/client'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { updateAccountAction } from '@action/admin/account/update'
import S3Image from '@component/shared/image'

export interface AdminAccountProps {
  account: Account
}

export default function AdminAccount({ account }: AdminAccountProps) {
  const [banner, setBanner] = useState(account.banner || '')
  const [photo, setPhoto] = useState(account.photo || '')
  const [email, setEmail] = useState(account.email || '')
  const [name, setName] = useState(account.name || '')
  const [bio, setBio] = useState(account.bio || '')
  const [active, setActive] = useState(account.active ?? true)

  const [baseline, setBaseline] = useState({
    banner: account.banner ?? '',
    photo: account.photo ?? '',
    email: account.email ?? '',
    name: account.name ?? '',
    bio: account.bio ?? '',
    active: account.active ?? true
  })

  const hasChanges = useMemo(() => {
    return (
      banner !== baseline.banner ||
      photo !== baseline.photo ||
      email !== baseline.email ||
      name !== baseline.name ||
      bio !== baseline.bio ||
      active !== baseline.active
    )
  }, [banner, photo, email, name, bio, active, baseline])

  return (
    <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
      <div className="admin-form-heading">
        <p>Account ID {account.id}</p>
        <Link href="/admin">Go Back</Link>
      </div>

      <div className="admin-form-media">
        {banner && (
          <>
            <p>
              Banner
              <button onClick={() => setBanner('')}>Remove</button>
            </p>
            <div className="banner">
              <S3Image s3Key={banner} alt="Profile Banner" fill />
            </div>
          </>
        )}

        {photo && (
          <>
            <p>
              Photo
              <button onClick={() => setPhoto('')}>Remove</button>
            </p>
            <div className="photo">
              <S3Image s3Key={photo} alt="Profile Photo" fill />
            </div>
          </>
        )}
      </div>

      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        placeholder="tim@apple.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="name">Name</label>
      <input
        type="text"
        name="name"
        placeholder="Tim Cook"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="bio">Bio</label>
      <textarea
        name="bio"
        placeholder="Tim Cook is the CEO of Apple Inc."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div className="form-checkbox">
        <label htmlFor="active">Active</label>
        <input
          type="checkbox"
          name="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </div>

      <button
        type="button"
        disabled={!hasChanges}
        onClick={async () => {
          try {
            const payload = await updateAccountAction({
              where: { id: account.id },
              data: { banner, photo, email, name, bio, active }
            })
            if (payload.ok) {
              setBaseline({
                ...baseline,
                banner,
                photo,
                email,
                name,
                bio,
                active
              })
              toast.success(payload.message)
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
    </form>
  )
}
