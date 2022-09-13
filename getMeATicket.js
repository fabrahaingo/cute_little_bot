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
    .hour(18)
    .minute(4)
  let in30seconds = () => moment().add(config.WAIT_TIME, 'seconds')
  let left = moment.duration(future.diff(in30seconds(), 'milliseconds'))

  if (left.hours() < 0) {
    log.rm()
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

function getCategories() {
  return {
    optima: 0,
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eigth: 8,
    ninth: 9,
    tenth: 10
  }
}

async function selectTicket(page, ticketsToBook) {
  if (isNaN(ticketsToBook)) {
    log.err('Tickets to book should be a number')
    process.exit(1)
  }
  const categories = getCategories()
  const remainingPlaces = await page.evaluate(() => {
    const categories = {
      optima: 0,
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
      fifth: 5,
      sixth: 6,
      seventh: 7,
      eigth: 8,
      ninth: 9,
      tenth: 10
    }
    let remaining = {}
    for (let category of Object.keys(categories)) {
      if (document.getElementById(`eventFormData[${categories[category]}].quantity`))
        remaining[category] = Object.keys(document.getElementById(`eventFormData[${categories[category]}].quantity`).children).length - 1
    }
    return remaining
  })

  let reserved = false

  for (let cat of Object.keys(remainingPlaces)) {
    if (remainingPlaces[cat] >= ticketsToBook) {
      page.select(`#eventFormData\\[${categories[cat]}\\]\\.quantity`, ticketsToBook.toString())
      reserved = true
      break
    }
  }

  if (reserved === false) {
    log.err(`Pas assez de places disponibles, tentative avec ${ticketsToBook} places...`)
    await selectTicket(page, ticketsToBook - 1)

    if (ticketsToBook === 0) {
      log.err('Il ne reste aucune place pour cette représentation')
      process.exit(1)
    }
  } else {
    log.ok(`${ticketsToBook} places ont été réservées avec succès !`)
  }
}

async function checkLinkReleased(condition, page, productId) {
  try {
    let iterations = 0
    let date = Date.now()
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
  }
  catch (err) {
    console.log(err.message)
    throw new Error('Catcha page is shown')
    // handle captcha
  }
}

(async () => {
  try {
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

    let condition = data.items[0].template !== 'available'

    await waitForLaunch()

    // Repeat until booking available
    await checkLinkReleased(condition, page, productId)
      .then(async () => {
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

        await selectTicket(page, config.TICKETS_TO_BOOK)
        await page.click('#book', { clickCount: 1 })
      })
      .catch((err) => {
        log.err(err.message)
      })

    //return 0
  }
  catch (err) {
    console.log(err)
  }
})()
