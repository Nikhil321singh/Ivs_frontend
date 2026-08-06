// AWS Amplify setup for direct-to-S3 uploads from the browser.
//
// Auth model: this app authenticates its own users with phone-OTP + a backend
// JWT — unrelated to AWS. Image uploads go straight from the browser using
// temporary credentials vended by the Cognito Identity Pool. That pool has
// guest access DISABLED, so it only hands out credentials to an authenticated
// Cognito User Pool identity. We therefore sign a single shared "service
// account" User Pool user in (lazily, on first upload) and every upload rides
// that identity's authenticated IAM role (EcommAuthRole), which must allow
// s3:PutObject on ivs/* (bucket policy grants public read).
//
// SECURITY NOTE: the service-account username/password live in VITE_* env vars,
// which Vite inlines into the client bundle — anyone can extract them and assume
// that role's S3 permissions. Keep the role least-privilege.
import { Amplify } from 'aws-amplify'
import { signIn, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

const region = import.meta.env.VITE_AWS_REGION
export const S3_BUCKET = import.meta.env.VITE_S3_BUCKET
export const S3_REGION = region

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      // Pool rejects guest access; we always authenticate as the service user.
      allowGuestAccess: false,
    },
  },
  Storage: {
    S3: { bucket: S3_BUCKET, region },
  },
})

const SVC_USERNAME = import.meta.env.VITE_COGNITO_SVC_USERNAME
const SVC_PASSWORD = import.meta.env.VITE_COGNITO_SVC_PASSWORD

// Single-flight guard so concurrent uploads don't each trigger a sign-in.
let inflight = null

async function signInServiceAccount() {
  // signIn throws if a user is already signed in; only sign in when there isn't.
  try {
    await getCurrentUser()
  } catch {
    // USER_PASSWORD_AUTH is the flow verified enabled on this app client.
    await signIn({
      username: SVC_USERNAME,
      password: SVC_PASSWORD,
      options: { authFlowType: 'USER_PASSWORD_AUTH' },
    })
  }
  return fetchAuthSession({ forceRefresh: true })
}

/**
 * Resolves once the browser holds valid AWS credentials for S3. Returns the
 * current session if we already have credentials; otherwise signs the shared
 * service account in and returns the fresh session. Safe to call before every
 * upload — it's a no-op once a live session exists.
 */
export async function ensureCognitoSession() {
  try {
    const session = await fetchAuthSession()
    if (session.credentials) return session
  } catch {
    // no session yet — fall through to sign-in
  }
  if (!inflight) {
    inflight = signInServiceAccount().catch((err) => {
      inflight = null // allow a later retry after a failed sign-in
      throw err
    })
  }
  return inflight
}
