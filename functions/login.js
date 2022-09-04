import config from '../config.js'

async function inputCredentials(page) {
  await page.goto(config.LOGIN_PAGE)
  await page.click(config.USERNAME_SELECTOR, { clickCount: 3 })
  await page.keyboard.type(process.env.OPERA_USERNAME)
  await page.click(config.PASSWORD_SELECTOR, { clickCount: 3 })
  await page.keyboard.type(process.env.OPERA_PASSWORD)
  await page.click(config.BUTTON_SELECTOR)
}

async function checkLoginSuccess(page) {
  const response = await page.waitForNavigation({ waituntil: 'loaded' })
  await response.request().redirectChain()
  await page.waitForSelector(`${config.SUCCESS_SELECTOR_1}, ${config.SUCCESS_SELECTOR_2}`)
  let cookies = await page.cookies()
  process.env.COOKIES = JSON.stringify(cookies)
  return page
}

async function login(page) {

  try {
    await inputCredentials(page)
    await checkLoginSuccess(page)
    return
  }
  catch (error) {
    throw new Error('Failed to log in, try again')
  }
}

export default { login }