import { useCallback, useEffect, useState } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { getWallet, getTransactions, createTopupOrder, verifyTopup } from '../api/wallet'
import { openCheckout } from '../lib/razorpay'
import { txnMeta, txnDate } from '../constants/ledger'

// Credits / token wallet. Shows the live balance (GET /wallet), a top-up flow
// (Razorpay, same order→checkout→verify contract as PaymentGateway), and the
// recent ledger. Reached from the hamburger menu ("Credits").
const AMOUNTS = [100, 200, 500]

export default function Wallet() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(100)
  const [payStatus, setPayStatus] = useState('idle') // idle | ordering | checkout | verifying
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    const [w, t] = await Promise.allSettled([getWallet(), getTransactions({ limit: 10 })])
    if (w.status === 'fulfilled') setWallet(w.value.wallet)
    if (t.status === 'fulfilled') setTxns(t.value.items || [])
    if (w.status === 'rejected') setError(w.reason?.message || 'Could not load your wallet.')
  }, [])

  useEffect(() => {
    let alive = true
    refresh().finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [refresh])

  const busy = payStatus !== 'idle'

  const topup = async () => {
    if (busy) return
    setError('')
    setNotice('')

    let order
    setPayStatus('ordering')
    try {
      order = await createTopupOrder(amount)
    } catch (err) {
      setPayStatus('idle')
      setError(
        err?.status === 0
          ? "Can't reach the server. Check your connection."
          : err?.message || "Couldn't start the top-up."
      )
      return
    }

    let handles
    setPayStatus('checkout')
    try {
      handles = await openCheckout({
        keyId: order.razorpayKeyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Grest',
        description: `${order.tokens} token top-up`,
        prefill: { name: user?.name || user?.companyName, email: user?.email, contact: user?.mobile },
      })
    } catch (err) {
      setPayStatus('idle')
      if (err?.code === 'dismissed') setNotice('Top-up cancelled.')
      else setError(err?.message || 'The payment could not be completed.')
      return
    }

    setPayStatus('verifying')
    try {
      const { balance } = await verifyTopup({
        orderId: order.orderId,
        paymentId: handles.paymentId,
        signature: handles.signature,
      })
      setWallet((w) => ({ ...(w || {}), balance }))
      setNotice(`Added ${order.tokens} tokens.`)
      refresh()
    } catch (err) {
      if (err?.status === 400) {
        setError("We couldn't verify this payment. If money was deducted, contact support.")
      } else {
        setNotice('Payment received — your balance will update shortly.')
        refresh()
      }
    } finally {
      setPayStatus('idle')
    }
  }

  const payLabel =
    payStatus === 'ordering'
      ? 'Starting…'
      : payStatus === 'checkout'
      ? 'Waiting for payment…'
      : payStatus === 'verifying'
      ? 'Confirming…'
      : `Add ₹${amount} · ${amount} tokens`

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-8 pt-2 font-spline">
        <BackButton to={ROUTES.home} />

        <h1 className="text-h1 font-bold text-ink">Credits</h1>

        {/* balance card */}
        <div className="flex flex-col gap-1.5 rounded-[18px] bg-secondary px-5 py-5 text-white">
          <span className="text-[12px] font-medium text-white/70">Token balance</span>
          <span className="text-[34px] font-bold leading-none">
            {loading ? '—' : (wallet?.balance ?? 0)}
          </span>
          <span className="text-[12px] font-normal text-white/70">1 token = ₹1 · IMEI ₹20 · Diagnose ₹50</span>
        </div>

        {/* top-up */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold text-ink">Add tokens</h2>
          <div className="flex gap-2.5">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a)}
                className={`flex-1 rounded-[12px] border-[1.5px] py-3 text-[14px] font-semibold transition ${
                  a === amount ? 'border-primary bg-pink-subtle text-primary' : 'border-line bg-white text-ink'
                }`}
              >
                ₹{a}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="rounded-[10px] bg-danger-subtle px-3.5 py-2.5 text-[13px] font-medium text-primary">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[10px] bg-success-subtle px-3.5 py-2.5 text-[13px] font-medium text-success">
              {notice}
            </p>
          )}

          <PrimaryButton onClick={topup} disabled={busy}>
            {payLabel}
          </PrimaryButton>
        </div>

        {/* recent ledger */}
        <div className="flex flex-col gap-2.5">
          <h2 className="text-[15px] font-semibold text-ink">Recent activity</h2>
          {loading ? (
            <p className="text-[13px] font-normal text-muted">Loading…</p>
          ) : txns.length === 0 ? (
            <p className="text-[13px] font-normal text-muted">No transactions yet.</p>
          ) : (
            txns.map((t) => {
              const m = txnMeta(t)
              return (
                <div
                  key={t.id || t._id}
                  className="flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px]"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="truncate text-[14px] font-semibold text-ink">{m.title}</span>
                    <span className="truncate text-[12px] font-normal text-muted">{txnDate(t.createdAt)}</span>
                  </span>
                  <span className={`shrink-0 text-[13px] font-bold ${m.credit ? 'text-success' : 'text-ink'}`}>
                    {m.amountLabel}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
