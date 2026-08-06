import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { uploadMedia } from '../api/media'

// Figma: "Sign & Sell Now" (§6.7). Final confirmation + signature. The signature
// is drawn on a canvas, exported as a PNG image and uploaded to S3 via
// /media/upload (category 'signature') when the sale is confirmed.
export default function SignSell() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(true)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)

  // Size the canvas backing store to its CSS box × devicePixelRatio so strokes
  // stay crisp, then scale the context so we can draw in CSS pixels.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#17171C'
  }, [])

  const posOf = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    drawing.current = true
    last.current = posOf(e)
  }

  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = posOf(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasDrawn) setHasDrawn(true)
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const canvasToFile = () =>
    new Promise((resolve, reject) => {
      canvasRef.current.toBlob((blob) => {
        if (!blob) return reject(new Error('Could not read signature'))
        resolve(new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' }))
      }, 'image/png')
    })

  const onSell = async () => {
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const file = await canvasToFile()
      await uploadMedia(file, 'signature')
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not complete the sale. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.tradeInVerify} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Sign &amp; sell</h1>
            <p className="text-[13px] font-normal text-muted">Confirm sale</p>
          </div>

          {/* receive amount */}
          <div className="flex items-center justify-between rounded-[16px] bg-pink-subtle px-4 py-4">
            <span className="text-[13px] font-medium text-ink">You receive</span>
            <span className="text-[24px] font-bold text-primary">₹62,999</span>
          </div>

          {/* signature pad */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-muted">Signature</label>
              {hasDrawn && (
                <button type="button" onClick={clear} className="text-[12px] font-semibold text-primary">
                  Clear
                </button>
              )}
            </div>
            <canvas
              ref={canvasRef}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              className="h-28 w-full touch-none rounded-[14px] border-[1.5px] border-dashed border-line bg-white"
            />
            {!hasDrawn && (
              <span className="text-[12px] font-normal text-muted">Sign above with your finger.</span>
            )}
          </div>

          {/* confirm checkbox */}
          <button
            type="button"
            onClick={() => setAgreed((v) => !v)}
            className="flex items-start gap-3 text-left"
          >
            <span
              className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] ${
                agreed ? 'border-primary bg-primary' : 'border-line bg-white'
              }`}
            >
              {agreed && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[13px] font-normal text-muted">
              I confirm the device details are correct and agree to Grest's trade-in terms.
            </span>
          </button>

          {error && <p className="text-[12px] font-medium text-primary">{error}</p>}
        </div>

        <PrimaryButton onClick={onSell} disabled={!agreed || !hasDrawn || submitting}>
          {submitting ? 'Completing…' : 'Sell Now'}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
