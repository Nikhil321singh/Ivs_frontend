import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InAppCamera from '../components/InAppCamera'
import { Preferences } from '@capacitor/preferences'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import Field from '../components/Field'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/user'
import { toEmail } from '../utils/format'

// This screen opens the OS camera/gallery. On low-RAM devices (e.g. the Redmi
// Note 9, flagged a "lowmemory device" by MIUI) Android's LMK kills the whole
// app process while the picker is foregrounded, so on return the app cold-starts
// and would drop the user on the start screen with their edits lost.
//
// We persist a "resume" record (flag + draft fields) so a kill is
// non-destructive: App.jsx sends the user back here on next launch and the text
// fields are restored. IMPORTANT: this MUST use @capacitor/preferences (native
// SharedPreferences), NOT localStorage — when the WebView is backgrounded for
// the picker it defers flushing localStorage to disk, so a SIGKILL loses the
// write. Native prefs flush immediately and survive the kill. (The picked photo
// itself can't survive process death — it must be re-picked.)
export const RESUME_KEY = 'grest:resumeProfileEdit'

const readResume = async () => {
  try {
    const { value } = await Preferences.get({ key: RESUME_KEY })
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}
const clearEditResume = () => Preferences.remove({ key: RESUME_KEY })

// Edit profile — PUT /user/update-profile (multipart). Sends only the fields
// that changed (name/companyName, email) plus an optional new photo, then
// updates the auth context from the server's returned user.
export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const isVendor = user?.userType === 'vendor'
  const nameKey = isVendor ? 'companyName' : 'name'
  const initialName = (isVendor ? user?.companyName : user?.name) || ''
  const initialEmail = user?.email || ''

  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.profileImage || null)
  const [showCamera, setShowCamera] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  // If we got here via a resume (App.jsx redirect after a process kill), restore
  // the in-progress field edits. No-op on a normal entry (no resume record).
  useEffect(() => {
    let alive = true
    readResume().then((draft) => {
      if (!alive || !draft) return
      if (draft.name != null) setName(draft.name)
      if (draft.email != null) setEmail(draft.email)
    })
    return () => {
      alive = false
    }
  }, [])

  const initials =
    (initialName || 'Grest user')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GS'

  // Apply a picked image to state (shared by the native + web paths).
  const applyPhoto = (file, previewUrl) => {
    setPhotoFile(file)
    setPhotoPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return previewUrl
    })
  }

  // Web fallback (desktop browser dev): plain <input type="file">.
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    applyPhoto(file, URL.createObjectURL(file))
  }

  // Live capture via the in-app camera (InAppCamera / getUserMedia) rather than the
  // native OS camera activity: on this low-memory Redmi MIUI kills — and won't
  // restart — the app when it's backgrounded for the native camera. Staying in-app
  // keeps the process foregrounded so it survives. File input is the no-camera
  // fallback (desktop dev).
  const onChangePhoto = () => {
    setError('')
    if (navigator.mediaDevices?.getUserMedia) {
      setShowCamera(true)
    } else {
      fileRef.current?.click()
    }
  }

  const onCapture = (file, previewUrl) => {
    applyPhoto(file, previewUrl)
    setShowCamera(false)
  }

  const onSave = async () => {
    if (saving) return
    setError('')

    const fd = new FormData()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (trimmedName && trimmedName !== initialName) fd.append(nameKey, trimmedName)
    if (trimmedEmail && trimmedEmail !== initialEmail) fd.append('email', trimmedEmail)
    if (photoFile) fd.append('profileImage', photoFile)

    // Nothing changed — just go back.
    if ([...fd.keys()].length === 0) {
      clearEditResume()
      navigate(ROUTES.profile)
      return
    }

    setSaving(true)
    try {
      const { user: updated } = await updateProfile(fd)
      setUser(updated)
      clearEditResume()
      navigate(ROUTES.profile)
    } catch (err) {
      setError(err.message || 'Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      {showCamera && (
        <InAppCamera onCapture={onCapture} onCancel={() => setShowCamera(false)} />
      )}
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.profile} onClick={clearEditResume} />

          <h1 className="text-h1 font-bold text-ink">Edit profile</h1>

          {/* avatar + photo picker */}
          <div className="flex items-center gap-4">
            <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-secondary font-sans text-[26px] font-bold text-white">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPickPhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={onChangePhoto}
                className="self-start rounded-[8px] border-[1.5px] border-line bg-white px-3 py-[7px] text-[12px] font-semibold text-ink active:bg-field"
              >
                Change photo
              </button>
              <p className="text-[12px] font-normal text-muted">JPG, PNG or WEBP · up to 5MB</p>
            </div>
          </div>

          {/* editable fields */}
          <div className="flex flex-col gap-3">
            <Field
              label={isVendor ? 'Business name' : 'Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isVendor ? 'Business name' : 'Your name'}
            />
            <Field
              label="Email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(toEmail(e.target.value))}
              placeholder="you@email.com"
            />
            {/* Login number is fixed to the OTP-verified mobile — read only. */}
            <Field
              label="Mobile (verified)"
              value={user?.mobile ? `+91 ${user.mobile}` : ''}
              readOnly
            />
          </div>

          {error && (
            <p role="alert" className="text-[13px] font-medium text-primary">
              {error}
            </p>
          )}
        </div>

        <PrimaryButton onClick={onSave} disabled={saving} className="mt-4">
          {saving ? 'Saving…' : 'Save changes'}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
