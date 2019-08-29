const puppeteer = require('puppeteer');
const login = require('./functions/login.js');
const inputs = require('./functions/getInputs.js');
const utils = require('./functions/utils.js');

(async () => {

  // Log in and go to event page
  let credentials = await inputs.getCredentials()
  let performanceLink = await inputs.getPerformanceLink()
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  })
  const page = await browser.newPage()
  try {
    await login.login(page, credentials)
  } catch (error) {
    console.log('Login failed (timeout or wrong credentials)')
    process.exit(1)
  }
  await page.goto(performanceLink, { waitUntil: 'load' })

  await page.content()
  body = await page.evaluate(() => { // Getting page content
    return JSON.parse(document.querySelector("body").innerText)
  })

  let iterations = 0
  let date = Date.now()

  // Repeat until booking available
  while (body.items[0].template !== "available") {
    await page.goto(performanceLink, { waitUntil: 'load' })
    body = await page.evaluate(() => {
      return JSON.parse(document.querySelector("body").innerText)
    })
    iterations++
    if (iterations % 10 == 0) {
      console.log(`Refreshing at a rate of ${iterations / Math.floor((Date.now() - date) / 1000)} times per second`)
    }
  }

  console.log(body.items[0].content.block.buttons[1].url)
  console.log("Found it ! Getting you there...")

  await utils.beep()
  await page.bringToFront()

  await page.goto(body.items[0].content.block.buttons[1].url, { waitUntil: 'networkidle0' })
  return 0

})()
