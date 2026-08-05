import { useEffect, useState } from 'react'
import PhoneFrame from './PhoneFrame'
import BackButton from './BackButton'
import { PrimaryButton, OutlineButton } from './Button'
import { useAuth } from '../context/AuthContext'
import { createTopupOrder, verifyTopup, getWallet } from '../api/wallet'
import { openCheckout } from '../lib/razorpay'

// Token top-up via Razorpay, per the backend contract:
//   1. POST /wallet/topup/order  → { orderId, amount(paise), razorpayKeyId }
//   2. Razorpay Checkout overlay → { paymentId, signature }
//   3. POST /wallet/topup/verify → credits tokens, returns new balance
// The paid feature (IVS ₹20 / Diagnose ₹50) then debits those tokens server-side.
//
// Each step has its own failure mode and message. The riskiest is a payment that
// succeeds but whose /verify call fails (network drop): money left the customer,
// so we DON'T show a hard error — the Razorpay webhook credits it regardless, and
// we tell the user that.
// `chargeTokens`: optional async fn that runs the actual paid feature server-side
// (e.g. POST /ivs/verify), which debits the token wallet and returns the result
// (incl. the new balance). Wiring it is what makes the balance actually update.
export default function PaymentGateway({ amount, payee, description, backTo, onPaid, chargeTokens }) {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle') // idle | ordering | checkout | verifying
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [wallet, setWallet] = useState(null)

  const busy = status !== 'idle'

  // Load token balance so "Pay with tokens" can be offered / gated.
  useEffect(() => {
    let alive = true
    getWallet()
      .then((w) => alive && setWallet(w.wallet))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const balance = wallet?.balance ?? 0

  // Pay using existing token balance: run the feature, which debits tokens
  // server-side and returns the fresh balance.
  const payWithTokens = async () => {
    if (busy) return
    setError('')
    setNotice('')
    if (balance < amount) {
      setError(
        `Not enough tokens — you have ${balance}, this needs ${amount}. Top up in Credits or pay via Razorpay.`
      )
      return
    }
    if (!chargeTokens) {
      onPaid?.({ balance: balance - amount, method: 'tokens' })
      return
    }
    setStatus('charging')
    try {
      const result = await chargeTokens()
      setStatus('idle')
      onPaid?.({ ...result, method: 'tokens' })
    } catch (err) {
      setStatus('idle')
      setError(
        err?.status === 402
          ? `Not enough tokens for this. Top up in Credits or pay via Razorpay.`
          : err?.message || 'Could not complete. Please try again.'
      )
    }
  }

  const pay = async () => {
    if (busy) return
    setError('')
    setNotice('')

    // 1) Create the order.
    let order
    setStatus('ordering')
    try {
      order = await createTopupOrder(amount)
    } catch (err) {
      setStatus('idle')
      setError(
        err?.status === 0
          ? "Can't reach the server. Check your connection and try again."
          : err?.message || "Couldn't start the payment. Please try again."
      )
      return
    }

    // 2) Open Checkout.
    let handles
    setStatus('checkout')
    try {
      handles = await openCheckout({
        keyId: order.razorpayKeyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: payee || 'Grest',
        description: description || `₹${amount} token top-up`,
        prefill: {
          name: user?.name || user?.companyName,
          email: user?.email,
          contact: user?.mobile,
        },
      })
    } catch (err) {
      setStatus('idle')
      // Cancelling is a soft state — invite a retry, don't alarm.
      if (err?.code === 'dismissed') setNotice('Payment cancelled. You can try again.')
      else setError(err?.message || 'The payment could not be completed.')
      return
    }

    // 3) Verify + credit.
    setStatus('verifying')
    try {
      const { balance } = await verifyTopup({
        orderId: order.orderId,
        paymentId: handles.paymentId,
        signature: handles.signature,
      })
      // Tokens are now credited — run the actual feature, which debits them back
      // and returns the result. Net token change is zero (₹20 → 20 tokens → spent).
      if (chargeTokens) {
        setStatus('charging')
        const result = await chargeTokens()
        setStatus('idle')
        onPaid?.({ ...result, orderId: order.orderId, method: 'razorpay' })
      } else {
        setStatus('idle')
        onPaid?.({ balance, orderId: order.orderId })
      }
    } catch (err) {
      setStatus('idle')
      // Payment already went through at Razorpay; the webhook will credit it.
      // A 400 (bad signature) is the only genuinely suspicious case.
      if (err?.status === 400) {
        setError("We couldn't verify this payment. If money was deducted, contact support with your payment ID.")
      } else {
        setNotice(
          'Payment received — confirming your tokens. This can take a moment; your balance will update shortly.'
        )
      }
    }
  }

  const label =
    status === 'ordering'
      ? 'Starting…'
      : status === 'checkout'
      ? 'Waiting for payment…'
      : status === 'verifying'
      ? 'Confirming…'
      : status === 'charging'
      ? 'Running check…'
      : `Pay ₹${amount}`

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={backTo} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Payment</h1>
            <p className="text-[13px] font-normal text-muted">Pay to {payee}</p>
          </div>

          {/* summary card */}
          <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-line bg-white px-[18px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-normal text-muted">Paying to</span>
              <span className="text-[14px] font-semibold text-ink">{payee}</span>
            </div>
            <div className="h-px w-full bg-line" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-normal text-muted">Amount</span>
              <span className="text-[18px] font-bold text-primary">₹{amount}</span>
            </div>
          </div>

          <p className="text-[12px] font-normal leading-[1.5] text-muted">
            You'll pay securely via Razorpay (UPI, cards, netbanking). ₹{amount} credits{' '}
            {amount} Grest tokens used for this check.
          </p>

          {error && (
            <p role="alert" className="rounded-[10px] bg-danger-subtle px-3.5 py-2.5 text-[13px] font-medium text-primary">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[10px] bg-warning-subtle px-3.5 py-2.5 text-[13px] font-medium text-warning">
              {notice}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Option 1 — pay from the token wallet */}
          <PrimaryButton onClick={payWithTokens} disabled={busy}>
            Pay with tokens · {amount} tokens
          </PrimaryButton>
          {/* Option 2 — pay ₹ directly via Razorpay */}
          <OutlineButton onClick={pay}>
            {status === 'idle' ? `Pay ₹${amount} · Razorpay` : label}
          </OutlineButton>
          <p className="text-center text-[12px] font-normal text-muted">
            {wallet ? `Token balance: ${balance} · ` : ''}Secured by Razorpay · 256-bit encrypted
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}
