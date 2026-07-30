import { useEffect, useState } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'
import { getTransactions } from '../api/wallet'
import { txnMeta, txnDate } from '../constants/ledger'

// Records = the real token ledger (GET /wallet/transactions): every top-up and
// every IVS/Diagnose charge, newest first. Figma layout (Record History
// 7750:1979) adapted to real entries.
export default function RecordHistory() {
  const [state, setState] = useState({ loading: true, error: '', items: [] })

  useEffect(() => {
    let alive = true
    getTransactions({ page: 1, limit: 50 })
      .then((res) => alive && setState({ loading: false, error: '', items: res.items || [] }))
      .catch((err) =>
        alive && setState({ loading: false, error: err.message || 'Could not load records.', items: [] })
      )
    return () => {
      alive = false
    }
  }, [])

  return (
    <PhoneFrame
      scroll={false}
      bg="bg-screen-grad"
    >
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 pt-3 font-spline">
        <header className="flex flex-col gap-[3px]">
          <h1 className="text-[24px] font-bold text-ink">Record History</h1>
          <p className="text-[13px] font-normal text-muted">All your activity in one place</p>
        </header>

        {state.loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-24">
            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary" />
            <p className="text-[13px] font-medium text-muted">Loading your records…</p>
          </div>
        ) : state.error ? (
          <p className="rounded-[12px] bg-danger-subtle px-4 py-3 text-[13px] font-medium text-primary">
            {state.error}
          </p>
        ) : state.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 pt-24 text-center">
            <p className="text-[15px] font-semibold text-ink">No records yet</p>
            <p className="max-w-[260px] text-[13px] font-normal text-muted">
              Your verifications, diagnoses and top-ups will show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {state.items.map((t) => {
              const m = txnMeta(t)
              return (
                <div
                  key={t.id || t._id}
                  className="flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-indigo-subtle">
                    <img src={`/assets/icons/${m.icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="truncate text-[14px] font-semibold text-ink">{m.title}</span>
                    <span className="truncate text-[12px] font-normal text-muted">{txnDate(t.createdAt)}</span>
                  </span>
                  <span
                    className={`shrink-0 text-[13px] font-bold ${m.credit ? 'text-success' : 'text-ink'}`}
                  >
                    {m.amountLabel}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="records" />
    </PhoneFrame>
  )
}
