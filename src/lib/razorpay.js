// Razorpay Checkout integration. The backend owns the money-critical steps
// (POST /wallet/topup/order → order, POST /wallet/topup/verify → credit); this
// module only loads the Checkout SDK and opens the overlay, returning the
// payment handles the backend needs to verify.
const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loadPromise = null

// Load checkout.js exactly once. Rejects with a clear, user-facing message if
// the network/SDK is unavailable so callers can surface it.
export function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null // allow a retry on the next attempt
      reject(new Error("Couldn't load the payment gateway. Check your connection and try again."))
    }
    document.body.appendChild(script)
  })
  return loadPromise
}

// Open Razorpay Checkout for an existing order.
// Resolves → { paymentId, signature } on a successful payment.
// Rejects  → Error with `.code`: 'dismissed' (user closed) | 'failed' (gateway
//            declined) | 'sdk' (SDK missing). Callers map these to messages.
export async function openCheckout({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'Grest',
  description,
  prefill = {},
}) {
  await loadRazorpay()
  if (!window.Razorpay) {
    const err = new Error('Payment gateway is unavailable right now.')
    err.code = 'sdk'
    throw err
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount, // paise — must match the order; Razorpay cross-checks it
      currency,
      name,
      description,
      prefill: {
        name: prefill.name || undefined,
        email: prefill.email || undefined,
        contact: prefill.contact || undefined,
      },
      theme: { color: '#EB2652' },
      retry: { enabled: false },
      handler: (res) =>
        resolve({
          paymentId: res.razorpay_payment_id,
          signature: res.razorpay_signature,
        }),
      modal: {
        ondismiss: () => {
          const err = new Error('Payment cancelled.')
          err.code = 'dismissed'
          reject(err)
        },
      },
    })

    rzp.on('payment.failed', (res) => {
      const err = new Error(res?.error?.description || 'The payment could not be completed.')
      err.code = 'failed'
      err.reason = res?.error?.reason
      reject(err)
    })

    rzp.open()
  })
}
