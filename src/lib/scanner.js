import { Capacitor } from '@capacitor/core'

// Scan a 15-digit IMEI with Google ML Kit's live barcode scanner.
// We use @capacitor-mlkit/barcode-scanning's `scan()` — the ready-to-use Google
// code scanner (GmsBarcodeScanner). It runs inside Google Play Services' own
// process, not the app's WebView camera surface, so it survives on the low-RAM
// Redmi where an in-app live camera would get killed by Android's LMK. IMEIs are
// printed as a Code128 barcode on the box / SIM tray / under the battery.
//
// Throws a coded message the caller maps to UI:
//   'WEB_UNSUPPORTED'     — desktop browser (no native scanner)
//   'CANCELLED'           — user backed out of the scanner (silent)
//   'CAMERA_DENIED'       — camera permission refused
//   'CAMERA_BLOCKED'      — permission hard-denied; only Settings can undo it
//   'SCANNER_UNAVAILABLE' — native plugin missing from this build
//   'NO_IMEI'             — nothing that looks like a 15-digit IMEI was scanned
export async function scanImei() {
  if (!Capacitor.isNativePlatform()) throw new Error('WEB_UNSUPPORTED')

  // The native scanner only exists if the MLKit pod / Gradle dep was part of the
  // build. Drop it (as a simulator build does) and every call below rejects as
  // "not implemented" — which, lumped in with the camera errors, reads as a
  // permission problem and sends you looking in the wrong place. Check up front.
  if (!Capacitor.isPluginAvailable('BarcodeScanner')) throw new Error('SCANNER_UNAVAILABLE')

  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')

  // Camera permission. Only 'prompt' states can raise the OS dialog, so check
  // first and request when askable. If it's already been denied, Android won't
  // re-prompt — surface CAMERA_BLOCKED so the UI can point the user to Settings.
  let status = await BarcodeScanner.checkPermissions()
  if (status.camera === 'prompt' || status.camera === 'prompt-with-rationale') {
    status = await BarcodeScanner.requestPermissions()
  }
  if (status.camera !== 'granted' && status.camera !== 'limited') {
    throw new Error(status.camera === 'denied' ? 'CAMERA_BLOCKED' : 'CAMERA_DENIED')
  }

  // The Google barcode scanner is an on-demand Play Services module; make sure
  // it's downloaded before the first scan (no-op once installed).
  try {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    if (!available) await BarcodeScanner.installGoogleBarcodeScannerModule()
  } catch {
    // Older / non-GMS devices: fall through and let scan() surface any error.
  }

  let barcodes
  try {
    ;({ barcodes } = await BarcodeScanner.scan())
  } catch (err) {
    // Every branch below collapses the failure into a coded string, so log the
    // real one first — otherwise a missing plugin, an ML Kit fault and a genuine
    // permission denial are indistinguishable from the UI.
    console.error('[scanner] BarcodeScanner.scan() failed:', err)
    const msg = err?.message || ''
    if (/cancel/i.test(msg)) throw new Error('CANCELLED')
    if (err?.code === 'UNIMPLEMENTED' || /not implemented|unimplemented/i.test(msg)) {
      throw new Error('SCANNER_UNAVAILABLE')
    }
    throw new Error('CAMERA_DENIED')
  }

  if (!barcodes || barcodes.length === 0) throw new Error('CANCELLED')

  for (const b of barcodes) {
    const digits = (b.rawValue || '').replace(/\D/g, '')
    const match = digits.match(/\d{15}/)
    if (match) return match[0]
    if (digits.length >= 14) return digits.slice(0, 15)
  }
  throw new Error('NO_IMEI')
}

// Open the app's system settings so the user can flip Camera permission back on
// after a hard denial (Android won't re-show the in-app prompt in that state).
export async function openScannerSettings() {
  if (!Capacitor.isNativePlatform()) return
  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')
  await BarcodeScanner.openSettings()
}
