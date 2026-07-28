import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'
import { RECORD_GROUPS } from '../constants/records'

// Figma: Record History 7750:1979 — Records bottom-nav tab. Grouped activity list
// (Theft / Diagnoses / Payment / Check Device Price) with a View action each.
// Uses Spline Sans (per the updated design). Frontend only: View is a placeholder.
export default function RecordHistory() {
  return (
    <PhoneFrame
      scroll={false}
      bg=""
      style={{ backgroundImage: 'linear-gradient(to bottom, #fbe2e9 0%, #fdf6f1 100%)' }}
    >
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 pt-3 font-spline">
        {/* header */}
        <header className="flex flex-col gap-[3px]">
          <h1 className="text-[24px] font-bold text-ink">Record History</h1>
          <p className="text-[13px] font-normal text-muted">All your activity in one place</p>
        </header>

        {/* grouped records */}
        {RECORD_GROUPS.map((r) => (
          <section key={r.id} className="flex flex-col gap-2.5">
            <h2 className="text-[15px] font-semibold text-ink">{r.group}</h2>
            <button
              type="button"
              onClick={() => {}}
              className="flex w-full items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px] text-left transition duration-150 active:scale-[0.98] active:bg-field"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-indigo-subtle">
                <img src={`/assets/icons/${r.icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="truncate text-[14px] font-semibold text-ink">
                  {r.device ? `${r.id} · ${r.device}` : r.id}
                </span>
                <span className="truncate text-[12px] font-normal text-muted">{r.datetime}</span>
              </span>
              <span className="shrink-0 rounded-[8px] bg-indigo-subtle py-[5px] pl-2.5 pr-[11px] text-[11px] font-semibold text-secondary">
                View
              </span>
            </button>
          </section>
        ))}
      </div>

      <BottomNav active="records" />
    </PhoneFrame>
  )
}
