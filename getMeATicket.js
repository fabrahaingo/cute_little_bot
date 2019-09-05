const puppeteer = require('puppeteer');
const login = require('./functions/login');
const inputs = require('./functions/getInputs');
const utils = require('./functions/utils');
const events = require('./functions/parseEvents');

(async () => {
  
  // Get avant-premiere links
  try {
    console.log('Getting avant-premières of 19-20 season...')
    performances = await events.getPerformances()
    await events.getLink(performances)
  } catch (error) {
    console.log(error)
    console.log('Error while parsing performance pages')
    process.exit(1)
  }
  
  // Get credentials
  try {
    if (!process.env.OPERA_USERNAME || !process.env.OPERA_PASSWORD) {
      console.log(`Save credentials with "export OPERA_USERNAME=yourUsername && export OPERA_PASSWORD=yourPassword"`)
      await inputs.getCredentials()
    } else {
      response = await inputs.keepCredentials()
      if (response == false) {
        await inputs.getCredentials()
      }
    }
  } catch (error) {
    console.log('Error while getting your credentials')
    process.exit(1)
  }

  // Get performance link
  let browser
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    })
  } catch (error) {
    console.log('Error while getting performance link')
    process.exit(1)
  }

  const page = await browser.newPage()  
  await page.setDefaultTimeout(0)

  try {
    await login.login(page)
  } catch (error) {
    console.log('Login failed (timeout or wrong credentials)')
    process.exit(1)
  }
  await page.goto(process.env.OPERA_PERF_LINK, { waitUntil: 'load' })

  await page.content()
  body = await page.evaluate(() => { // Getting page content
    return JSON.parse(document.querySelector('body').innerText)
  })

  let iterations = 0
  let date = Date.now()

  // Repeat until booking available
  while (body.items[0].template !== 'available') {
    await page.goto(process.env.OPERA_PERF_LINK, { waitUntil: 'load' })
    body = await page.evaluate(() => {
      return JSON.parse(document.querySelector('body').innerText)
    })
    iterations++
    if (iterations == 10) {
      date = utils.getRefreshRate(date)
      iterations = 0
    }
  }

  await utils.beep()
  console.log(body.items[0].content.block.buttons[1].url)
  console.log('Found it ! Getting you there...')
  
  await page.bringToFront()

  await page.goto(body.items[0].content.block.buttons[1].url, { waitUntil: 'networkidle0' })
  return 0

})()
