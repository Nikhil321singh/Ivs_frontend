// Central route map. Relative hash routes — Capacitor/WebView safe.
// Scope: Onboarding, Home/Nav, Theft(IMEI ₹20), Diagnosis(₹50), Aadhaar+IMEI(₹5).
export const ROUTES = {
  splash: '/',
  login: '/login',
  otp: '/otp',
  register: '/register',
  home: '/home',
  menu: '/menu',
  records: '/records',
  wallet: '/wallet',
  profile: '/profile',
  profileEdit: '/profile/edit',
  privacy: '/privacy',
  help: '/help',
  // Not shipping this release — routed to the Coming Soon placeholder
  comingSoon: '/coming-soon',
  // Trade-in / device price
  tradeIn: '/trade-in',
  tradeInDetails: '/trade-in/details',
  tradeInVerify: '/trade-in/verify',
  tradeInSign: '/trade-in/sign',
  // Theft / IMEI verification (₹20)
  imeiEnter: '/imei',
  payment20: '/imei/pay',
  imeiResult: '/imei/result',
  // Diagnosis (₹50)
  diagnose: '/diagnose',
  payment50: '/diagnose/pay',
  diagnoseScan: '/diagnose/scan',
  diagnoseReport: '/diagnose/report',
  // Aadhaar + IMEI (₹5)
  aadhaar: '/aadhaar',
  aadhaarOtp: '/aadhaar/otp',
}
