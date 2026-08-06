// AWS Amplify setup for direct-to-S3 uploads from the browser.
//
// Auth model: this app authenticates its own users with phone-OTP + a backend
// JWT — unrelated to AWS. Image uploads go straight from the browser using
// temporary credentials vended by the Cognito Identity Pool as an
// UNAUTHENTICATED (guest) identity — so no login/username/password is needed.
// This requires the Identity Pool to have "unauthenticated access" enabled and
// its guest IAM role to allow s3:PutObject on ivs/* (bucket policy grants
// public read). Amplify fetches the guest credentials automatically on the
// first Storage call.
import { Amplify } from 'aws-amplify'

const region = import.meta.env.VITE_AWS_REGION
export const S3_BUCKET = import.meta.env.VITE_S3_BUCKET
export const S3_REGION = region

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      // Upload as a guest — no user sign-in.
      allowGuestAccess: true,
    },
  },
  Storage: {
    S3: { bucket: S3_BUCKET, region },
  },
})
