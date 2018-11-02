async function login(page) {
  const prompt = require('prompt-async');
  const inputs = require('./getInputs.js');

  let credentials = await inputs.getCredentials();

  // Go to login page
  await page.goto('https://billetterie.operadeparis.fr/account/login');

  const USERNAME_SELECTOR = '#login';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#continue_button > span.text';

  // Inputing credentials
  await page.click(USERNAME_SELECTOR,
      { clickCount: 3 });
  await page.keyboard.type(credentials.username);
  await page.click(PASSWORD_SELECTOR,
      { clickCount: 3});
  await page.keyboard.type(credentials.password);
  await page.click(BUTTON_SELECTOR);
  await page.waitForNavigation();

  // Retries if login fails
  try {
    await page.waitForSelector('body > div.content-wrapper > section',
    { timeout: 10000 });
  }
  catch (error) {
    await console.log("Couldn't log you in... Try again !");
    await page.reload;
    await login(page);
  }
  return;
}

module.exports = {
  login,
};
