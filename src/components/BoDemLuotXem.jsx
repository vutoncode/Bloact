'use client'

import { useEffect } from 'react'

export default function BoDemLuotXem({ postId }) {
  useEffect(() => {
    if (!postId) return
    fetch('/api/bai-viet/luot-xem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    }).catch(() => {})
  }, [postId])

  return null
}
