import puppeteer from 'puppeteer'
import login from './functions/login.js'
import inputs from './functions/getInputs.js'
import utils from './functions/utils.js'
import event from './functions/parseEvents.js'
import fetch from 'node-fetch'
import config from './config.js'
import log from './functions/displayMessages.js'

// function cookiesToString() {
//   let result = ''
//   const mandatory_cookies = ['stx_contact_ONP_Internet_v1', 'STX_SESSION']
//   for (let cookie of JSON.parse(process.env.COOKIES)) {
//     if (mandatory_cookies.includes(cookie.name)) {
//       result += `${cookie.name}=${cookie.value}; `
//     }
//   }
//   return result
// }

async function getAndSelectPerf() {
  try {
    console.log('Getting avant-premières of 22-23 season...')
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

  // Repeat until booking available
  while (condition) {

    // METHOD 1
    // response = await fetch(process.env.OPERA_PERF_LINK)
    // data = await response.json()

    // METHOD 2 ⚠️ we still have to get the final link once it is found
    // response = await fetch(`https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${productId}`, {
    //   method: 'get',
    //   headers: {
    //     'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
    //     cookie: cookieStr,
    //     'Host': 'billetterie.operadeparis.fr'
    //   }
    // })
    // data = await response.text()
    // if (data.includes(`data-date="${process.env.OPERA_PERF_DATE}"`)) {
    //   console.log('Link is released')
    //   break
    // }

    // METHOD 3: same as previous method, but using puppeteer to avoid bot blocking
    await page.goto(`https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${productId}`, {
      waitUntil: 'domcontentloaded'
    })
    const foundDate = await page.evaluate(() => {
      const events = document.getElementsByClassName('date_time_venue')
      return events[0].getAttribute('data-date')
    })
    if (foundDate === process.env.OPERA_PERF_DATE) {
      console.log('Link is released')
      // Retrieve link in page
      break
    }

    iterations++
    if (iterations % 10 === 0) {
      // let str = await data.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      // console.log(str)
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
