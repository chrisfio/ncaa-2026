'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const INTERVAL_MS = 60_000

export default function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) router.refresh()
    }

    const id = setInterval(tick, INTERVAL_MS)
    return () => clearInterval(id)
  }, [router])

  return null
}
