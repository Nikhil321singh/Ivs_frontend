// Home 2x2 grid tile: white card (border 1.5 line, r16, p16), pink icon tile (44,
// #fce7ec, r13, icon 22) + label Semibold 14.
// `soon`: feature not shipping yet → shows a pink "COMING SOON" chat-bubble badge.
export default function ActionCard({ icon, label, onClick, soon = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-1 flex-col items-start gap-3 rounded-[16px] border-[1.5px] border-line bg-white p-4 text-left transition duration-150 active:scale-[0.97] active:bg-field"
    >
      {soon && (
        <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-[9px] bg-primary px-2 py-1 shadow-[0_2px_7px_rgba(235,38,82,0.3)]">
          <span className="text-[8px] font-bold uppercase leading-none tracking-[0.04em] text-white">
            Coming Soon
          </span>
          {/* chat-bubble tail — downward triangle at bottom-left, clear of the text */}
          <span
            aria-hidden="true"
            className="absolute -bottom-[5px] left-2.5 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary"
          />
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-pink-subtle">
        <img src={`/assets/icons/${icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
      </span>
      <span className="text-[14px] font-semibold text-ink">{label}</span>
    </button>
  )
}
