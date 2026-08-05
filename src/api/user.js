// User/profile endpoints (Ivs_backend /user/*).
import { apiRequest } from './client'

// GET /user/profile — data: { user }.
export const getProfile = () => apiRequest('/user/profile')

// PUT /user/update-profile — multipart/form-data. Accepts any of:
//   name, companyName, email, profileImage (File). data: { user }.
export const updateProfile = (formData) =>
  apiRequest('/user/update-profile', { method: 'PUT', isForm: true, body: formData })

// --- KYC / Aadhaar e-KYC (individual) ---------------------------------------
// The Aadhaar must be OTP-verified (send-otp → verify-otp) BEFORE complete-kyc.

// POST /user/aadhaar/send-otp — starts UIDAI e-KYC. body { aadhaarNumber } (raw
// 12 digits). data: {}. 409 if already verified / linked elsewhere.
export const sendAadhaarOtp = (aadhaarNumber) =>
  apiRequest('/user/aadhaar/send-otp', { method: 'POST', body: { aadhaarNumber } })

// POST /user/aadhaar/verify-otp — body { otp } (6 digits). data: { user } with
// aadhaarVerified: true. 400 on wrong/expired OTP.
export const verifyAadhaarOtp = (otp) =>
  apiRequest('/user/aadhaar/verify-otp', { method: 'POST', body: { otp } })

// POST /user/complete-kyc — multipart/form-data. data: { user } (kycCompleted).
//   individual: userType, name, phone, email, panNumber, aadhaarNumber (must
//               match the already-verified Aadhaar).
//   vendor:     userType, companyName, phone, email, panNumber, gstNumber,
//               profileImage (owner image, required).
export const completeKyc = (formData) =>
  apiRequest('/user/complete-kyc', { method: 'POST', isForm: true, body: formData })
