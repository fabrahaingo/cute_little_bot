const puppeteer = require('puppeteer');
const prompt = require("prompt-async");
const login = require('./functions/login.js');
const inputs = require('./functions/getInputs.js');
const hackline = require('./functions/hackline.js');
const utils = require('./functions/utils.js');

// For testing purposes
function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false // Don't set to true (or else you won't see the final booking page)
  })
  const page = await browser.newPage();

  try {
    await login.login(page);
  }
  catch (error) {
    await console.log(error);
    await console.log('Unexpected error while loging you in...');
    return;
  }

  hackline.skipLine(browser);

  await page.bringToFront();

  var schema = {
    properties: {
      performance_type: {
        required: true
      },
      performance_name: {
         required: true
      }
    }
  }

  // Asking for BALLET or OPERA
  // Asking for PERF_NAME (replace all ' ' by '-') => "la dame aux camelias" must become "la-dame-aux-camelias"
  prompt.start();
  const url_values = await prompt.get(schema);
  const target_url = 'https://www.operadeparis.fr/saison-18-19/' + url_values.performance_type + '/' + url_values.performance_name + '/performances';

  await page.goto(target_url,
      {waitUntil: 'load'});

  var iterations = 1;

  // Getting JSON content  
  innerText = await page.evaluate(() => {
  return JSON.parse(document.querySelector("body").innerText); 
  });

  // Making AJAX requests until product gets available
  while (innerText.items[0].template !== "available") {
    await page.goto(target_url,
    {waitUntil: 'load'});
    innerText = await page.evaluate(() => {
      return JSON.parse(document.querySelector("body").innerText);
    });

    // Displaying number of refresh iterations
    if (iterations % 5 == 0) {
      console.log('page refreshed ' + iterations + ' times');
    }
    iterations++;
  }

  // If product gets available, finds link and redirects to it
  if (innerText.items[0].template === "available") {
    const found_url = innerText.items[0].content.expand.blocks[0][0].buttons[1].url;
    console.log(found_url);
    console.log("Found a reservation link on the page, getting you there");

    await utils.beep();

    await page.goto(found_url,
        { waitUntil: 'networkidle0' });
    return;
  }
  // In case product is available but not link was provided...
  else {
  console.log("No reservation link available yet...");
    await browser.close()
  }

})()
