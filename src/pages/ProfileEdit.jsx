import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import Field from '../components/Field'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/user'
import { toEmail } from '../utils/format'

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

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

  // Native (Capacitor): use @capacitor/camera. The HTML file-input + `capture`
  // path triggers MIUI's WebView to reload the page on return from the OS camera
  // (WebView is killed on this low-RAM device), which cold-restarts the app and
  // bounces the user to the start screen. The plugin routes the camera/gallery
  // through Capacitor's own activity-result handling, so the WebView survives.
  const onChangePhoto = async () => {
    if (!Capacitor.isNativePlatform()) {
      fileRef.current?.click()
      return
    }
    setError('')
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // let the user choose camera or gallery
        width: 512,
        height: 512,
        correctOrientation: true,
        promptLabelHeader: 'Profile photo',
        promptLabelPhoto: 'Choose from gallery',
        promptLabelPicture: 'Take photo',
      })
      if (!photo?.webPath) return
      const blob = await (await fetch(photo.webPath)).blob()
      const ext = photo.format || 'jpeg'
      const file = new File([blob], `profile.${ext}`, {
        type: blob.type || `image/${ext}`,
      })
      applyPhoto(file, photo.webPath) // webPath is WebView-safe to render
    } catch (err) {
      // Plugin throws "User cancelled photos app" on cancel — ignore that.
      const msg = err?.message || ''
      if (!/cancel/i.test(msg)) {
        setError('Could not open the camera. Check camera permission and try again.')
      }
    }
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
      navigate(ROUTES.profile)
      return
    }

    setSaving(true)
    try {
      const { user: updated } = await updateProfile(fd)
      setUser(updated)
      navigate(ROUTES.profile)
    } catch (err) {
      setError(err.message || 'Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PhoneFrame
      bg=""
      style={{ backgroundImage: 'linear-gradient(to bottom, #fbe2e9 0%, #ffffff 42%, #fcf3ed 100%)' }}
    >
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.profile} />

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
