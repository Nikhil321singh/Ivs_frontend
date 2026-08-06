// End-to-end test of the ACTUAL app upload path: aws-amplify signIn + uploadData
// (same library/calls as src/lib/amplify.js + src/api/media.js), then verifies
// the object is publicly readable. Run: node scripts/s3-e2e.mjs
import { Amplify } from 'aws-amplify'
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { uploadData } from 'aws-amplify/storage'

// --- config (mirrors .env VITE_* values) ---
const REGION = 'ap-south-1'
const BUCKET = 'grest-ecomm-test'
const cfg = {
  userPoolId: 'ap-south-1_HrVgGoFk1',
  userPoolClientId: '2juk0bhutclbvnch1pb1e8pjl9',
  identityPoolId: 'ap-south-1:a75ffbf1-0e6c-4ca3-90e9-c3e168e955b0',
  allowGuestAccess: false,
}
const SVC = { username: 'nikesh.agarwal@agbeindia.com', password: 'Grest@124' }

// In-memory token storage so Amplify Auth works outside a browser.
const mem = {}
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  setItem: async (k, v) => void (mem[k] = v),
  getItem: async (k) => (k in mem ? mem[k] : null),
  removeItem: async (k) => void delete mem[k],
  clear: async () => Object.keys(mem).forEach((k) => delete mem[k]),
})

Amplify.configure({
  Auth: { Cognito: cfg },
  Storage: { S3: { bucket: BUCKET, region: REGION } },
})

const step = (n, m) => console.log(`${n}) ${m}`)

// 1) sign in the service account (exactly like ensureCognitoSession)
step(1, 'signIn service account (USER_PASSWORD_AUTH)...')
try { await signOut() } catch {}
const si = await signIn({
  username: SVC.username, password: SVC.password,
  options: { authFlowType: 'USER_PASSWORD_AUTH' },
})
console.log('   ✔ isSignedIn:', si.isSignedIn)
const sess = await fetchAuthSession({ forceRefresh: true })
console.log('   ✔ AWS creds present:', !!sess.credentials, '| identityId:', sess.identityId)

// 2) uploadData a real PNG to ivs/device-photos/... (exactly like uploadMedia)
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)
const key = `ivs/device-photos/e2e-${Date.now()}.png`
step(2, `uploadData -> ${key} (${png.length} bytes, image/png)`)
const out = await uploadData({
  path: key,
  data: png,
  options: { contentType: 'image/png' },
}).result
console.log('   ✔ uploaded, returned path:', out.path)

// 3) verify public read (what the app does with the returned url)
const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
step(3, `public GET ${url}`)
const r = await fetch(url)
const buf = Buffer.from(await r.arrayBuffer())
console.log('   status:', r.status, '| content-type:', r.headers.get('content-type'), '| bytes:', buf.length)
const ok = r.status === 200 && buf.length === png.length && buf.equals(png)
console.log(`   ${ok ? '✔ byte-for-byte match' : '✗ mismatch'}`)

console.log(ok ? '\nEND-TO-END PASSED ✅  ' + url : '\nEND-TO-END FAILED ✗')
process.exit(ok ? 0 : 1)
