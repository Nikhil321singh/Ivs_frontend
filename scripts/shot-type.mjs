import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', args:['--no-sandbox','--disable-gpu','--hide-scrollbars'] })
const p = await b.newPage()
await p.setViewport({ width:390, height:844, deviceScaleFactor:3, isMobile:true, hasTouch:true })
await p.goto('http://localhost:5713/#/register', { waitUntil:'networkidle0' })
await p.waitForFunction(()=>document.getElementById('root')?.innerText.trim().length>0,{timeout:10000})
const inputs = await p.$$('input:not([type=file])')
// name, phone, email, aadhaar, pan
await inputs[0].type('gaurav sharma')
await inputs[1].type('9876543210')
await inputs[2].type('Gaurav@Email.com')
await inputs[3].type('123456789012')
await inputs[4].type('abcde1234f9z')   // messy: lowercase + extra chars
await new Promise(r=>setTimeout(r,300))
await p.screenshot({ path:'/tmp/grest-register-typed.png' })
console.log('done')
await b.close()
