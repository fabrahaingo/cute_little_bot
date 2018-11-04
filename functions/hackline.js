const utils = require('./utils.js');
const working_previous_link = 'https://billetterie.operadeparis.fr/secured/selection/event/date?productId=545979951'; // Last working link to access queue beforehand

async function skipLine(browser) {
  const page2 = await browser.newPage();
  await page2.goto(working_previous_link,
      { waitUntil: 'load' });

  // Know waiting line hack (to be improved...)
  try {
    while (page2.url() === working_previous_link) {
      page2.goto(working_previous_link,
          { waitUntil: 'load' });
      await utils.delay(1500);
    };
    if (page2.url() !== working_previous_link) {
      console.log('Waiting line now public. Please enter it manually and input the password in the browser manually. You can then return to the other tab');
      await page2.bringToFront();
      await utils.beep();
    };
  }
  catch (error) {
    console.log(error);
    console.log('There was an error refreshing the previously working link...');
    return;
  }
}

module.exports = {
  skipLine,
};
