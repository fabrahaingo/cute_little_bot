const puppeteer = require('puppeteer');
const prompt = require("prompt-async");

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  })
  const page = await browser.newPage();

  // First goes to login page to identify
  await page.goto('https://billetterie.operadeparis.fr/account/login')

  // Get all needed values from login page
  const USERNAME_SELECTOR = '#login';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#continue_button > span.text';

  prompt.start();
  const credentials = await prompt.get(["username", "password"]);

  // Input credentials, then log in
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(credentials.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(credentials.password);
  await page.click(BUTTON_SELECTOR);
  await page.waitForNavigation();

  // EITHER successful login OR returns error
  try {
  	await page.waitForSelector('body > div.content-wrapper > section > div > div > div > h2');
  }
  catch (error) {
	console.log("Couldn't connect with those credentials...");
	await page.close();
	await browser.close();
	return;
  }

  prompt.start();
  const url_values = await prompt.get(["performance_type", "performance_name"]);

  await page.goto('https://www.operadeparis.fr/saison-18-19/' + url_values.performance_type + '/' + url_values.performance_name + '/performances',
      {waitUntil: 'networkidle2'});

  const content = await page.content();
  
  innerText = await page.evaluate(() => {
	return JSON.parse(document.querySelector("body").innerText); 
  }); 

  if (innerText.items[0].template === "available") {
	console.log(innerText.items[0].content.expand.blocks[0][0].buttons[1].url);
	console.log("Found a reservation link on the page !");
  }
  else {
	  console.log("No reservation link available yet...");
  }

  await browser.close()
})()
