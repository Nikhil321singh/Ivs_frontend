// Home 2x2 grid tile: white card (border 1.5 line, r16, p16), pink icon tile (44,
// #fce7ec, r13, icon 22) + label Semibold 14.
export default function ActionCard({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-start gap-3 rounded-[16px] border-[1.5px] border-line bg-white p-4 text-left transition duration-150 active:scale-[0.97] active:bg-field"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-pink-subtle">
        <img src={`/assets/icons/${icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
      </span>
      <span className="text-[14px] font-semibold text-ink">{label}</span>
    </button>
  )
}
