import { useEffect, useRef, useState } from 'react'

// Full-screen, in-app LIVE camera built on getUserMedia. We render the viewfinder
// and shutter INSIDE the WebView instead of launching the native OS camera
// activity. On this low-memory Redmi, MIUI kills (and refuses to restart) the app
// whenever it's backgrounded for the heavy native camera — "the camera crashes
// the app". Keeping capture in-app means the process never backgrounds, so it
// survives. Returns a JPEG File + object-URL preview via onCapture; onCancel closes.
export default function InAppCamera({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    async function start() {
      setError('')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setError('Cannot access the camera. Allow camera permission for Grest in Settings, then try again.')
      }
    }
    start()
    return () => {
      cancelled = true
      stop()
    }
  }, [facingMode])

  const shoot = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file, URL.createObjectURL(blob))
      },
      'image/jpeg',
      0.85,
    )
  }

  const flip = () => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* live viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="text-[14px] font-medium leading-[1.5] text-white">{error}</p>
          </div>
        )}
        {/* close (top-left) */}
        <button
          type="button"
          aria-label="Close camera"
          onClick={onCancel}
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 active:bg-black/60"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* controls */}
      <div className="flex items-center justify-between px-10 pb-10 pt-6">
        {/* flip camera */}
        <button
          type="button"
          aria-label="Switch camera"
          onClick={flip}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9.5 13.5a2.5 2.5 0 1 0 2.5-2.5M12 8.5V11l-1.5-1M14.5 12.5a2.5 2.5 0 0 1-2.5 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* shutter */}
        <button
          type="button"
          aria-label="Take photo"
          onClick={shoot}
          disabled={!!error}
          className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-[4px] border-white/80 disabled:opacity-40"
        >
          <span className="h-[58px] w-[58px] rounded-full bg-white transition active:scale-90" />
        </button>

        {/* spacer to balance the flip button */}
        <span className="h-12 w-12" />
      </div>
    </div>
  )
}
