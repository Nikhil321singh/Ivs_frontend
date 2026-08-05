// App screen wrapper. NO device mockup chrome (the phone border + "9:41" status bar in
// Figma is just the demo preview). Full-bleed: the screen fills the viewport, the OS
// provides the real status bar, and we reserve the safe-area insets (notch / home
// indicator). A max-width cap keeps it from stretching in a desktop browser.
//
// scroll=true (default): children live in a single scroll area.
// scroll=false: children manage their own layout (e.g. a scroll region + a pinned
// BottomNav). Top safe-area is applied; the page/nav handles the bottom inset.
// overlay: rendered inside the relative frame (sibling to content) for sheets/drawers
// that must be positioned within the phone bounds, not the whole browser window.
export default function PhoneFrame({ children, bg = 'bg-screen-grad', style, scroll = true, overlay }) {
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-white">
      {/* h-[100dvh] fixes the frame to the viewport so inner regions scroll within it
          (instead of the frame growing to fit content, which would break sheet scrolling) */}
      <div
        className={`relative flex h-[100dvh] w-full max-w-phone flex-col overflow-hidden ${bg}`}
        style={style}
      >
        {scroll ? (
          <div
            className="no-scrollbar flex min-h-0 flex-1 animate-fade-in flex-col overflow-y-auto"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {children}
          </div>
        ) : (
          <div
            className="flex min-h-0 flex-1 animate-fade-in flex-col overflow-hidden"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {children}
          </div>
        )}
        {overlay}
      </div>
    </div>
  )
}
