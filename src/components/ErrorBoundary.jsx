import { Component } from 'react'

// App-wide error boundary. Catches render/lifecycle crashes anywhere in the tree
// so a single bad screen can't white-out the whole WebView (important on-device,
// where there's no dev overlay). Shows a recoverable fallback. `resetKey` (e.g.
// the current route) lets the boundary auto-clear when the user navigates.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prevProps) {
    // Clear the error when the reset key changes (navigation), so the user isn't
    // stuck on the fallback after moving to a healthy screen.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-screen-grad px-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-subtle">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v5" stroke="#EB2652" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1.1" fill="#EB2652" />
              <circle cx="12" cy="12" r="9" stroke="#EB2652" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-h2 font-bold text-ink">Something went wrong</h1>
          <p className="max-w-[300px] text-[14px] font-normal text-muted">
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => {
              // Reset to the splash route and reload a clean tree.
              window.location.hash = '#/'
              window.location.reload()
            }}
            className="mt-1 rounded-btn bg-primary px-6 py-3 text-button font-semibold text-white transition active:scale-[0.98] active:bg-primary-press"
          >
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
