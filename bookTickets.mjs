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
import getCredentials from "./functions/getCredentials.mjs";
import waitForLaunch from "./functions/waitForLaunch.mjs";
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

    /*
      2. Book tickets
    */
    await waitForLaunch();
    await refreshUntilTicketsAvailable();
    await createCart();
    await getOrderToken();
    while (1) {
      await refreshCart();
    }
  } catch (err) {
    log.err("Error while booking tickets, please try again.");
    log.err(err);
    // process.exit(1);
  }
})();
