import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', args:['--no-sandbox','--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width:390, height:560, deviceScaleFactor:2, isMobile:true, hasTouch:true })
await p.goto('http://localhost:5713/#/home', { waitUntil:'networkidle0' })
await p.waitForFunction(()=>document.getElementById('root')?.innerText.trim().length>0,{timeout:10000})
await p.click('button[aria-label="Menu"]')
await new Promise(r=>setTimeout(r,400))
const res = await p.evaluate(() => {
  const menu = [...document.querySelectorAll('.overscroll-contain')].find(d=>d.className.includes('overflow-y-auto'))
  const home = [...document.querySelectorAll('div')].find(d=>d.className.includes('overflow-y-auto') && !d.className.includes('overscroll-contain'))
  const out = {
    menuFound: !!menu,
    menuOverflows: menu ? menu.scrollHeight > menu.clientHeight : null,
    menuScrollHeight: menu?.scrollHeight, menuClientHeight: menu?.clientHeight,
    homeOverflowStyle: home ? getComputedStyle(home).overflowY : null,
  }
  const homeBefore = home?.scrollTop
  if (menu) menu.scrollTop = 9999
  out.menuTopAfterScroll = menu?.scrollTop
  out.homeTopUnchanged = home?.scrollTop === homeBefore
  return out
})
console.log(JSON.stringify(res,null,2))
await b.close()
