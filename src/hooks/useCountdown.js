import { useEffect, useState } from 'react'

// Simple seconds countdown used for OTP resend timers. Returns { seconds, restart }.
// Frontend-only: no real resend request is made.
export default function useCountdown(from = 24) {
  const [seconds, setSeconds] = useState(from)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])

  return { seconds, restart: () => setSeconds(from) }
}
