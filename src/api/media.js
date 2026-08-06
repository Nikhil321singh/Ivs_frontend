// Generic media (image) uploads — Ivs_backend POST /media/upload.
// Stores images in S3 and returns their public URLs. Used for device photos,
// the sale signature, and any other non-profile images.
import { apiRequest } from './client'

// Uploads one File or an array of Files under a category
// ('device-photos' | 'signature' | 'misc'). Resolves to { files: [{ url, key }] }.
export const uploadMedia = (files, category = 'misc') => {
  const fd = new FormData()
  ;[].concat(files).forEach((file) => fd.append('files', file))
  fd.append('category', category)
  return apiRequest('/media/upload', { method: 'POST', isForm: true, body: fd })
}
