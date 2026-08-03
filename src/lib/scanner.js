import { Capacitor } from '@capacitor/core'

// Scan a 15-digit IMEI with Google ML Kit's live barcode scanner.
// We use @capacitor-mlkit/barcode-scanning's `scan()` — the ready-to-use Google
// code scanner (GmsBarcodeScanner). It runs inside Google Play Services' own
// process, not the app's WebView camera surface, so it survives on the low-RAM
// Redmi where an in-app live camera would get killed by Android's LMK. IMEIs are
// printed as a Code128 barcode on the box / SIM tray / under the battery.
//
// Throws a coded message the caller maps to UI:
//   'WEB_UNSUPPORTED' — desktop browser (no native scanner)
//   'CANCELLED'       — user backed out of the scanner (silent)
//   'CAMERA_DENIED'   — camera permission refused
//   'NO_IMEI'         — nothing that looks like a 15-digit IMEI was scanned
export async function scanImei() {
  if (!Capacitor.isNativePlatform()) throw new Error('WEB_UNSUPPORTED')

  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')

  // Camera permission — 'limited' also counts as usable.
  const perm = await BarcodeScanner.requestPermissions()
  if (perm.camera !== 'granted' && perm.camera !== 'limited') {
    throw new Error('CAMERA_DENIED')
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
    if (/cancel/i.test(err?.message || '')) throw new Error('CANCELLED')
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
