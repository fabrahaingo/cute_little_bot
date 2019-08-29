const config = require('../config.js')

module.exports.login = async function(page, credentials) {

  await page.goto(config.LOGIN_PAGE);

  await page.click(config.USERNAME_SELECTOR,{ clickCount: 3 })
  await page.keyboard.type(credentials.username)
  await page.click(config.PASSWORD_SELECTOR,{ clickCount: 3})
  await page.keyboard.type(credentials.password)

  await page.click(config.BUTTON_SELECTOR)
  try {
    const response = await page.waitForNavigation({waituntil: 'loaded'});
    await response.request().redirectChain();
    await page.waitForSelector(`${config.SUCCESS_SELECTOR_1}, ${config.SUCCESS_SELECTOR_2}`, { timeout: 10000 })
    return
  }
  catch {
    throw new Error('Failed to log in, try again')
  }
}