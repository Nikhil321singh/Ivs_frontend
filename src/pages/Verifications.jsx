import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InAppCamera from '../components/InAppCamera'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { uploadMedia } from '../api/media'

// Figma: "Verifications" (§6.7). Pre-sale checks — IVS (optional), Aadhaar, and
// device photos. IVS/Aadhaar rows are illustrative; the device photos are real:
// each captured image is uploaded to S3 via /media/upload (category
// 'device-photos') and its returned URL is kept in state.
const ROWS = [
  { key: 'ivs', title: 'IVS (IMEI) verification', sub: 'Optional · not mandatory to sell', status: 'Clean', tone: 'success' },
  { key: 'aadhaar', title: 'Aadhaar verification', sub: 'OTP verified', status: 'Verified', tone: 'success' },
]

const SLOTS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

export default function Verifications() {
  const navigate = useNavigate()

  // Per-slot capture state: { preview, url, uploading, error }.
  const [photos, setPhotos] = useState({})
  const [activeSlot, setActiveSlot] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const fileRef = useRef(null)

  const uploadedCount = SLOTS.filter((s) => photos[s.key]?.url).length

  const setSlot = (slot, patch) =>
    setPhotos((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }))

  // Uploads a captured/selected image for the active slot to S3.
  const handleFile = async (slot, file) => {
    const preview = URL.createObjectURL(file)
    setSlot(slot, { preview, url: null, uploading: true, error: '' })
    try {
      const { files } = await uploadMedia(file, 'device-photos')
      setSlot(slot, { url: files?.[0]?.url || null, uploading: false })
    } catch (err) {
      setSlot(slot, { uploading: false, error: err?.message || 'Upload failed' })
    }
  }

  // Prefer the in-app camera (getUserMedia) — the native OS camera crashes this
  // low-memory device. Fall back to a file input where getUserMedia is absent.
  const onCapturePress = (slot) => {
    setActiveSlot(slot)
    if (navigator.mediaDevices?.getUserMedia) {
      setShowCamera(true)
    } else {
      fileRef.current?.click()
    }
  }

  const onCameraCapture = (file) => {
    setShowCamera(false)
    if (activeSlot) handleFile(activeSlot, file)
  }

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file && activeSlot) handleFile(activeSlot, file)
  }

  if (showCamera) {
    return <InAppCamera onCapture={onCameraCapture} onCancel={() => setShowCamera(false)} />
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-1 flex-col gap-5">
          <BackButton to={ROUTES.tradeInDetails} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Verifications</h1>
            <p className="text-[13px] font-normal text-muted">Verify to sell · IVS optional · Aadhaar · photos</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {ROWS.map((r) => (
              <div
                key={r.key}
                className="flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="truncate text-[14px] font-semibold text-ink">{r.title}</span>
                  <span className="truncate text-[12px] font-normal text-muted">{r.sub}</span>
                </span>
                <span className="shrink-0 rounded-[8px] bg-success-subtle px-2.5 py-[5px] text-[11px] font-semibold text-success">
                  {r.status}
                </span>
              </div>
            ))}
          </div>

          {/* device photos */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">Upload device images</span>
              <span className="text-[12px] font-normal text-muted">{uploadedCount}/4 uploaded</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SLOTS.map((s) => {
                const p = photos[s.key]
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onCapturePress(s.key)}
                    className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-line bg-white transition active:scale-[0.98]"
                  >
                    {p?.preview ? (
                      <img src={p.preview} alt={s.label} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-muted">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke="#6B7280" strokeWidth="1.6" strokeLinejoin="round" />
                          <circle cx="12" cy="13" r="3.2" stroke="#6B7280" strokeWidth="1.6" />
                        </svg>
                        <span className="text-[12px] font-medium">{s.label}</span>
                      </span>
                    )}

                    {/* per-slot overlay: uploading / uploaded / error */}
                    {p?.uploading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
                      </span>
                    )}
                    {p?.url && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    {p?.error && !p?.uploading && (
                      <span className="absolute inset-x-0 bottom-0 bg-primary/90 px-1 py-0.5 text-[10px] font-semibold text-white">
                        Tap to retry
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[12px] font-normal text-muted">Front, back, and side photos help buyers trust the listing.</p>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
        </div>

        <PrimaryButton className="mt-5" onClick={() => navigate(ROUTES.tradeInSign)}>
          Continue
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
