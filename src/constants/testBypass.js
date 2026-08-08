// Test-only shortcut through the UIDAI Aadhaar e-KYC flow, so on-device testing
// doesn't burn real OTPs against a live identity.
//
// SAFETY: this is active ONLY when VITE_ENABLE_TEST_BYPASS is exactly 'true'.
// Vite inlines that comparison at build time, so in any build whose .env omits
// the flag the branch is statically false and the minifier drops it — the test
// values never reach a release bundle. Never set this flag in a release .env.
export const TEST_BYPASS = import.meta.env.VITE_ENABLE_TEST_BYPASS === 'true'

// UIDAI's published sandbox Aadhaar number — not a real identity.
export const TEST_AADHAAR = '999999990019'
export const TEST_OTP = '123456'
