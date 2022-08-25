import puppeteer from 'puppeteer'
import login from './functions/login.js'
import inputs from './functions/getInputs.js'
import utils from './functions/utils.js'
// import event from './functions/parseEvents.js'
import fetch from 'node-fetch'

(async () => {
  // Get avant-premiere links
  // try {
  //   console.log('Getting avant-premières of 22-23 season...')
  //   let performances = await event.getPerformances()
  //   await event.getLink(performances)
  // } catch (error) {
  //   console.log(error)
  //   console.log('Error while parsing performance pages')
  //   process.exit(1)
  // }

  process.env.OPERA_PERF_LINK = 'https://www.operadeparis.fr/saison-22-23/opera/salome/performances'

  // Get credentials
  try {
    if (!process.env.OPERA_USERNAME || !process.env.OPERA_PASSWORD) {
      console.log(
        `Save credentials with "export OPERA_USERNAME=yourUsername && export OPERA_PASSWORD=yourPassword"`
      )
      await inputs.getCredentials()
    } else {
      let response = await inputs.keepCredentials()
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

  console.log('Puppeteer launched successfully')

  const page = await browser.newPage()
  page.on('pageerror', function (err) {
    theTempValue = err.toString()
    console.log('Page error: ' + theTempValue)
  })
  page.on('error', function (err) {
    theTempValue = err.toString()
    console.log('Error: ' + theTempValue)
  })
  page.setDefaultTimeout(0)

  console.log('New page opened successfully')

  try {
    console.log('Trying to login')
    await login.login(page)
  } catch (error) {
    console.log(`Login failed (timeout or wrong credentials): ${error}`)
    process.exit(1)
  }

  console.log('Logged in successfully. Waiting for the performance link to be released...')
  // At this point, the user is logged in
  // Chromium is oppened and ready to perform actions for the user

  console.log(`Starting refreshes of ${process.env.OPERA_PERF_LINK}`)

  let iterations = 0
  let date = Date.now()

  let response = await fetch(process.env.OPERA_PERF_LINK)
  let data = await response.json()
  console.log(data)

  // Repeat until booking available
  while (data.items[0].template !== 'available') {
    // CHANGE
    response = await fetch(process.env.OPERA_PERF_LINK)
    data = await response.json()
    iterations++
    if (iterations == 10) {
      date = utils.getRefreshRate(date)
      iterations = 0
    }
  }

  utils.beep()
  console.log(body.items[0].content.block.buttons[0].url)
  console.log('Found it ! Getting you there...')

  await page.bringToFront()

  await page.goto(body.items[0].content.block.buttons[0].url, {
    waitUntil: 'networkidle0'
  })
  //return 0
})()
