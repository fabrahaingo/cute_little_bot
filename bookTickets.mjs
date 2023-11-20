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
async function navigateToUrl(page, url) {
  await page.goto(url).catch((err) => {
    log.err("Error while navigating to checkout page");
    console.log(err);
  });
  return;
}

(async () => {
  try {
    /*
      1. Setting up
    */
    await getCredentials();
    await getSessionToken();
    if (!config.SPECIFIC_PERF_ID) {
      await getAndSelectPerf();
      await getPerfId();
    } else {
      log.dim("Skipped selection: using specific performance id");
    }
    const page = await openBrowserAndSetCookie();
    const checkoutUrl = "https://mobile.operadeparis.fr/baseCheckout/redirect";
    await navigateToUrl(page, checkoutUrl);

    /* 
      2. Waiting line
    */
    waitingLine(page, checkoutUrl);

    /*
      3. Book tickets
    */
    await waitForLaunch();
    await refreshUntilTicketsAvailable();
    await createCart();
    await getOrderToken();
    while (process.env.WAITING_LINE_STATUS !== "COMPLETE") {
      log.dim(
        `Waiting for the waiting line... Current status: ${process.env.WAITING_LINE_STATUS}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      log.rm();
    }
    await openCartPage(page);
  } catch (err) {
    log.err("Error while booking tickets, please try again.");
    log.err(err);
    // process.exit(1);
  }
})();
