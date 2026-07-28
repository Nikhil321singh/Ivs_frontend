import puppeteer from 'puppeteer-core'
const [,,route,out,text] = process.argv
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', args:['--no-sandbox','--disable-gpu','--hide-scrollbars'] })
const p = await b.newPage()
await p.setViewport({ width:390, height:844, deviceScaleFactor:3, isMobile:true, hasTouch:true })
await p.goto(`http://localhost:5713/#${route}`, { waitUntil:'networkidle0' })
await p.waitForFunction(()=>document.getElementById('root')?.innerText.trim().length>0,{timeout:10000})
await p.evaluate((t)=>{ const el=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t); el&&el.click() }, text)
await new Promise(r=>setTimeout(r,300))
await p.screenshot({ path: out })
console.log('saved', out)
await b.close()
