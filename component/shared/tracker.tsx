'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { activityAction } from '@action/account/activity'

export default function NavigationTracker() {
  const pathname = usePathname()

  useEffect(() => {
    activityAction({
      type: 'navigation',
      description: pathname
    })
  }, [pathname])

  return null
}
