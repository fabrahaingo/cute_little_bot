import puppeteer from 'puppeteer'
import login from './functions/login.js'
import inputs from './functions/getInputs.js'
import utils from './functions/utils.js'
import event from './functions/parseEvents.js'
import fetch from 'node-fetch'
import config from './config.js'

(async () => {
  // Get avant-premiere links
  try {
    console.log('Getting avant-premières of 22-23 season...')
    let performances = await event.getPerformances()
    await event.getLink(performances)
  } catch (error) {
    console.log(error)
    console.log('Error while parsing performance pages')
    process.exit(1)
  }

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

  let page
  await browser.newPage().then((res) => {
    page = res
    page.setDefaultTimeout(0)
  })

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
  const productId = data.info.secutix_id

  let condition = config.ENVIRONMENT === 'DEV' ?
    iterations < 25 :
    data.items[0].template !== 'available'

  // Repeat until booking available
  while (condition) {
    // METHOD 1
    // response = await fetch(process.env.OPERA_PERF_LINK)
    // data = await response.json()

    // METHOD 2 ⚠️ we still have to get the final link once it is found
    response = await fetch(`https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${productId}`)
    data = await response.text()
    // If a button contains the Avant-Première date, this means that we can access the booking page
    if (data.includes(`data-date=${process.env.OPERA_PERF_DATE}`)) {
      console.log('Link is released')
    }
    iterations++
    if (iterations % 10 === 0) {
      date = utils.getRefreshRate(date)
    }
  }

  const foundLink = config.ENVIRONMENT === 'DEV' ?
    data.items[1].content.block.buttons[1].url :
    data.items[0].content.block.buttons[0].url

  console.log(foundLink)
  console.log('Found it ! Getting you there...')

  const params = new URLSearchParams(foundLink.substring(foundLink.indexOf('?'), foundLink.length))
  const perfId = params.get('id')

  const newLink = `https://billetterie.operadeparis.fr/secured/selection/event/seat?perfId=${perfId}&lang=fr&table=1`

  await page.bringToFront()

  await page.goto(newLink, {
    waitUntil: 'networkidle0'
  })
  await page.select('#eventFormData\\[0\\]\\.quantity', '2')
  await page.click('#book', { clickCount: 1 })
  //return 0
})()
