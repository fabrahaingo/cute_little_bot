import puppeteer from 'puppeteer'
import login from './functions/login.js'
import inputs from './functions/getInputs.js'
import utils from './functions/utils.js'
import event from './functions/parseEvents.js'
import fetch from 'node-fetch'
import config from './config.js'
import log from './functions/displayMessages.js'
import moment from 'moment'
import 'moment-timezone'

async function waitForLaunch() {
  let waitMs = config.WAIT_TIME * 1000
  let future = moment()
    .startOf('day')
    .hour(12)
    .minute(0)
  let in30seconds = () => moment().add(config.WAIT_TIME, 'seconds')
  let left = moment.duration(future.diff(in30seconds(), 'milliseconds'))

  if (left.hours() < 0) {
    log.err(`You missed 12h (opening hour). Please try again another day.`)
    process.exit(1)
  }

  while (future.diff(moment()) > waitMs) {
    await utils.delay(1000)
    log.rm()
    // writing in yellow
    log.warn(`Program will start in ${left.hours() ? `${left.hours()} h `: ''}${left.minutes() ? `${left.minutes()} min and ` : ''}${left.seconds()} sec`)
    left = moment.duration(future.diff(in30seconds()), 'milliseconds')
  }

  log.rm()
  log.ok('Starting to refresh\n')
  return
}

async function getAndSelectPerf() {
  try {
    log.dim('Getting avant-premières of 22-23 season...')
    let performances = await event.getPerformances()
    await event.getLink(performances)
  } catch (error) {
    console.log(error)
    log.err(`Error while parsing performance pages: ${error.message}`)
    process.exit(1)
  }
}

async function getCredentials() {
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
    console.log('\x1b[31m%s\x1b[0m', `Error while getting your credentials: ${error.message}`)
    process.exit(1)
  }
}

async function startPuppeteer() {
  try {
    let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    })
    let page = await browser.newPage()
    page.setDefaultTimeout(0)
    return page
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', `Error while getting performance link: ${error.message}`)
    process.exit(1)
  }
}

(async () => {
  // Get avant-premiere links
  await getAndSelectPerf()

  // Get credentials
  await getCredentials()

  // Get performance link
  const page = await startPuppeteer()

  try {
    log.dim('\nTrying to login')
    await login.login(page)
  } catch (error) {
    log.err(`Login failed (timeout or wrong credentials): ${error}`)
    process.exit(1)
  }

  log.ok('Logged in successfully.\n')
  // At this point, the user is logged in
  // Chromium is oppened and ready to perform actions for the user

  log.dim(`Checking time to run the program...\n`)

  let iterations = 0
  let date = Date.now()

  let response = await fetch(process.env.OPERA_PERF_LINK)
  let data = await response.json()
  const productId = data.info.secutix_id
  // const cookieStr = cookiesToString()
  if (config.ENVIRONMENT === 'DEV') {
    const day = data.items[1].content.performance.dayNumber
    const month = data.items[1].content.performance.month
    const year = new Date().getFullYear()
    process.env.OPERA_PERF_DATE = event.getStartTimestamp(`le ${day} ${month} ${year}`)
  }

  let condition = config.ENVIRONMENT === 'DEV' ?
    iterations < 25 :
    data.items[0].template !== 'available'

  await waitForLaunch()

  // Repeat until booking available
  while (condition) {
    // METHOD 3: same as previous method, but using puppeteer to avoid bot blocking
    await page.goto(`https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${productId}`, {
      waitUntil: 'domcontentloaded'
    })
    const foundDate = await page.evaluate(() => {
      const events = document.getElementsByClassName('date_time_venue')
      return events[0].getAttribute('data-date')
    })

    // if ticket is available
    if (foundDate === process.env.OPERA_PERF_DATE) {
      log.ok('Link is released')
      // Retrieve link in page
      break
    }

    iterations++
    if (iterations % 10 === 0) {
      // let str = await data.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      // console.log(str)
      date = utils.getRefreshRate(date, iterations)
    }
  }

  const foundLink = config.ENVIRONMENT === 'DEV' ?
    data.items[1].content.block.buttons[1].url :
    data.items[0].content.block.buttons[0].url

  console.log('Opening link and trying to book...')

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
