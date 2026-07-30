import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

// Scan a 15-digit IMEI. We DON'T use MLKit's in-app live scanner UI — on the
// low-RAM Redmi, Android's LMK kills the app while that camera surface is
// foregrounded (it "crashes on camera"). Instead we open the OS camera the same
// way Register/ProfileEdit do (a separate system process), then decode the IMEI
// barcode off the saved photo with MLKit's readBarcodesFromImage. IMEIs are
// printed as a Code128 barcode on the box / SIM tray / under the battery.
//
// Throws a coded message the caller maps to UI:
//   'WEB_UNSUPPORTED' — desktop browser (no native camera decode)
//   'CANCELLED'       — user backed out of the camera (silent)
//   'CAMERA_DENIED'   — camera permission refused
//   'NO_IMEI'         — photo had no readable 15-digit barcode
export async function scanImei() {
  if (!Capacitor.isNativePlatform()) throw new Error('WEB_UNSUPPORTED')

  let photo
  try {
    photo = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      promptLabelHeader: 'Scan IMEI',
    })
  } catch (err) {
    if (/cancel/i.test(err?.message || '')) throw new Error('CANCELLED')
    throw new Error('CAMERA_DENIED')
  }

  const path = photo?.path || photo?.webPath
  if (!path) throw new Error('CANCELLED')

  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')
  const { barcodes } = await BarcodeScanner.readBarcodesFromImage({ path })
  for (const b of barcodes) {
    const digits = (b.rawValue || '').replace(/\D/g, '')
    const match = digits.match(/\d{15}/)
    if (match) return match[0]
    if (digits.length >= 14) return digits.slice(0, 15)
  }
  throw new Error('NO_IMEI')
}
