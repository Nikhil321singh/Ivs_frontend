/** @type {import('tailwindcss').Config} */
// Design tokens extracted exactly from the Grest Figma file ("app desin" page).
// Do not hardcode arbitrary hex/spacing in components — use these theme values.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#EB2652',      // brand pink — primary buttons, active, key figures
        'primary-press': '#D31F48',
        secondary: '#2E2F81',    // brand indigo — section headers, outline buttons
        ink: '#17171C',          // primary text
        muted: '#6B7280',        // secondary text / placeholder
        line: '#ECE7EC',         // borders / dividers / phone frame
        field: '#F3F3F5',        // filled input / box backgrounds
        toggle: '#F1EFF3',       // segmented control track
        'pink-subtle': '#FCE7EC',
        'indigo-subtle': '#ECECF8',
        success: '#129E5E',
        'success-subtle': '#E7F6EE',
        warning: '#B26B00',
        'warning-subtle': '#FCF1DC',
        cream: '#FDF2E2',
        'danger-subtle': '#FDECEF',
        'grad-top': '#FBE2E9',   // screen bg gradient top stop
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        spline: ['"Spline Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // token: [size, line-height]
        caption: ['12px', '1.5'],
        badge: ['12px', '1'],
        label: ['13px', '1'],
        body: ['15px', '1.5'],
        value: ['15px', '1'],
        'card-title': ['16px', '1.3'],
        button: ['16px', '1'],
        section: ['16px', '1'],
        h2: ['22px', '1.2'],
        h1: ['24px', '1.2'],
        title: ['26px', '1.2'],
        display: ['38px', '1'],
      },
      spacing: {
        // 4/8-based scale actually used in the Figma frames
        4.5: '18px',
        5.5: '22px',
        6.5: '26px',
        7: '28px',
      },
      borderRadius: {
        phone: '36px',
        card: '16px',
        'card-lg': '20px',
        input: '12px',
        btn: '14px',
        pill: '24px',
        chip: '8px',
        otp: '14px',
        tile: '12px',
      },
      borderWidth: {
        1.5: '1.5px',
      },
      maxWidth: {
        // Full-width on any phone (largest ~440px), but capped on desktop browsers
        // so it doesn't stretch edge-to-edge on a wide screen.
        phone: '480px',
      },
      backgroundImage: {
        'screen-grad': 'linear-gradient(to bottom, #FBE2E9 0%, #FFFFFF 42%)',
        // Login screen: warm cream -> pink (exact stops from Figma 7649:1979)
        'login-grad':
          'linear-gradient(to bottom, #fdf6f1 5.569%, #fdf1f4 30.552%, #fbe5eb 44.334%)',
      },
      boxShadow: {
        sheet: '-2px 2px 5.2px rgba(0,0,0,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // subtle screen entrance on navigation
        'fade-in': 'fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
