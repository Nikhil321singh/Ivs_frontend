// Reliable mobile screenshotter for the Grest prototype.
// Usage: node scripts/shot.mjs <route> <outfile> [width] [height]
//   node scripts/shot.mjs /login /tmp/login.png
// Drives the installed Chrome via puppeteer-core, emulates an iPhone-class
// viewport, waits for React to paint (waits for the #root to have content).
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const [, , route = '/', out = '/tmp/shot.png', w = '390', h = '844'] = process.argv

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
try {
  const page = await browser.newPage()
  await page.setViewport({
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  })
  await page.goto(`http://localhost:5713/#${route}`, { waitUntil: 'networkidle0' })
  // wait until the app has actually rendered something into #root
  await page.waitForFunction(() => {
    const r = document.getElementById('root')
    return r && r.children.length > 0 && r.innerText.trim().length > 0
  }, { timeout: 10000 })
  await new Promise((r) => setTimeout(r, 350)) // let fonts/gradients settle
  await page.screenshot({ path: out })
  console.log('saved', out)
} finally {
  await browser.close()
}
