// Generic media (image) uploads — straight from the browser to AWS S3 via
// Amplify Storage (temporary creds from the Cognito Identity Pool; see
// ../lib/amplify). Objects land under ivs/<category>/... and are served as
// public direct URLs. Used for device photos, the sale signature, and any
// other non-profile images.
//
// Return shape is kept identical to the old backend endpoint —
//   { files: [{ url, key }] }
// — so callers (Verifications.jsx, SignSell.jsx) need no changes.
import { uploadData } from 'aws-amplify/storage'
import { ensureCognitoSession, S3_BUCKET, S3_REGION } from '../lib/amplify'

const publicUrl = (key) => `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`

// File extension from the filename, falling back to the MIME type.
const extFor = (file) => {
  const fromName = file.name && file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : ''
  if (fromName) return fromName
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type] || 'bin'
}

// Unique object key: ivs/<category>/<timestamp>-<rand>.<ext>
const objectKey = (category, file) =>
  `ivs/${category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(file)}`

// Uploads one File or an array of Files under a category
// ('device-photos' | 'signature' | 'misc'). Resolves to { files: [{ url, key }] }.
export const uploadMedia = async (files, category = 'misc') => {
  await ensureCognitoSession()
  const uploaded = await Promise.all(
    [].concat(files).map(async (file) => {
      const key = objectKey(category, file)
      await uploadData({
        path: key,
        data: file,
        options: { contentType: file.type || undefined },
      }).result
      return { url: publicUrl(key), key }
    })
  )
  return { files: uploaded }
}
