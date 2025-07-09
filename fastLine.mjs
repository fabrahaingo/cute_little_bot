import dotenv from "dotenv";
dotenv.config();
import config from "./config.js";
import "moment-timezone";
import event from "./functions/parseEvents.js";
import log from "./functions/customLogs.js";
import getPerfId from "./functions/getPerfId.js";
import getSessionToken from "./functions/getSessionToken.js";
import refreshUntilTicketsAvailable from "./functions/refreshUntilTicketsAvailable.js";
import createCart from "./functions/createCart.js";
import getOrderToken from "./functions/getOrderToken.js";
import openCartPage from "./functions/openCartPage.js";
import getCredentials from "./functions/getCredentials.mjs";
import openBrowserAndSetCookie from "./functions/openBrowserAndSetCookie.js";
import waitForLaunch from "./functions/waitForLaunch.mjs";
import waitingLine from "./functions/waitingLine.mjs";
import refreshCart from "./functions/refreshCartTimer.js";

async function getAndSelectPerf() {
  try {
    log.dim("Getting avant-premières of 23-24 season...");
    let performances = await event.getPerformances();
    await event.getLink(performances);
  } catch (error) {
    console.log(error);
    log.err(`Error while parsing performance pages: ${error.message}`);
    process.exit(1);
  }
}

// Using this function should trigger the waiting line
// If accessed before the opening, this should allow to finish it in advance
async function navigateToEventPage(page) {
  if (!config.SPECIFIC_PERF_ID && !process.env.PRODUCT_ID) {
    log.err("Missing secutix preview id and product id");
    process.exit(1);
  }

  const url = `https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${
    config.SPECIFIC_PERF_ID ?? process.env.PRODUCT_ID ?? ""
  }`;

  log.dim("Navigating to event page...");
  await page.goto(url).catch((err) => {
    log.err("Error while navigating to checkout page");
    console.log(err);
  });

  return;
}

async function logInIfNeeded(page) {
  if (!process.env.OPERA_USERNAME || !process.env.OPERA_PASSWORD) {
    log.err("Missing email and/or password");
    process.exit(1);
  }
  if (page.url().includes("login")) {
    await page
      .type("#login", process.env.OPERA_USERNAME, { delay: 1 })
      .catch((err) => {
        log.err("Error while typing email");
        console.log(err);
      });

    await page
      .type("#password", process.env.OPERA_PASSWORD, { delay: 1 })
      .catch((err) => {
        log.err("Error while typing password");
        console.log(err);
      });

    await page.click("#continue_button").catch((err) => {
      log.err("Error while clicking submit button");
      console.log(err);
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

(async () => {
  try {
    await getCredentials();
    await getSessionToken();

    if (!config.SPECIFIC_PERF_ID) {
      await getAndSelectPerf();
      await getPerfId();
    } else {
      log.dim("Skipped selection: using specific performance id");
    }

    const page = await openBrowserAndSetCookie();
    await navigateToEventPage(page);
    await logInIfNeeded(page);

    waitingLine(page);
  } catch (err) {
    log.err("Error while shortcuting waiting line, please try again.");
    log.err(err);
  }
})();
