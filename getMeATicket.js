const puppeteer = require('puppeteer');
const prompt = require("prompt-async");

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage();

  // First goes to login page to identify
  await page.goto('https://billetterie.operadeparis.fr/account/login')

  // Get all needed values from login page
  const USERNAME_SELECTOR = '#login';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#continue_button > span.text';

  var schema = {
	  properties: {
		  username: {
			  required: true
		  },
		  password: {
			  hidden: true,
			  required: true
		  }
	  }
  }

  prompt.start();
  const credentials = await prompt.get(schema);

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
  const target_url = 'https://www.operadeparis.fr/saison-18-19/' + url_values.performance_type + '/' + url_values.performance_name + '/performances';

  await page.goto(target_url,
      {waitUntil: 'load'});

  var iterations = 1;
  
  innerText = await page.evaluate(() => {
	return JSON.parse(document.querySelector("body").innerText); 
  });

  while (innerText.items[0].template !== "available") {
  	await page.goto(target_url,
		{waitUntil: 'load'});

	innerText = await page.evaluate(() => {
		return JSON.parse(document.querySelector("body").innerText);
	});
	if (iterations % 5 == 0) {
		console.log('page refreshed ' + iterations + ' times');
	}
	iterations++;
  }

  if (innerText.items[0].template === "available") {
	const found_url = innerText.items[0].content.expand.blocks[0][0].buttons[1].url;
	console.log(found_url);
	console.log("Found a reservation link on the page, getting you there");

	await page.goto(found_url,
		{waitUntil: 'networkidle0'});
	return;
  }
  else {
	console.log("No reservation link available yet...");
  	await browser.close()
  }

})()
