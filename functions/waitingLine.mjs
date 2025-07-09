import log from "./customLogs.js";
import config from "../config.js";

export default async function waitingLine(page) {
  process.env.WAITING_LINE_STATUS = "NOT_STARTED";

  if (!config.SPECIFIC_PERF_ID && !process.env.PRODUCT_ID) {
    log.err("Missing secutix preview id and product id");
    process.exit(1);
  }

  const url = `https://billetterie.operadeparis.fr/secured/selection/event/date?productId=${
    config.SPECIFIC_PERF_ID ?? process.env.PRODUCT_ID ?? ""
  }`;

  let i = 0;

  while (!page.url().includes("/pkpcontroller/")) {
    await page
      .goto(url, {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      })
      .catch((err) => {
        if (!err.message.includes("net::ERR_ABORTED")) {
          log.err("Error while navigating to checkout page");
          console.log(err);
        }
      });

    if (i > 0) log.rm();
    log.dim(`Waiting line not started yet... (refreshed ${i} times)`);
    i++;
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  process.env.WAITING_LINE_STATUS = "STARTED";
  log.ok("Waiting line started");
  page.bringToFront();

  i = 0;
  while (page.url().includes("/pkpcontroller/")) {
    if (i > 0) log.rm();
    log.dim(`Waiting in line... (${i} seconds)`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    i++;
  }

  // wait in case of multiple redirections
  await new Promise((resolve) => setTimeout(resolve, 5000));
  process.env.WAITING_LINE_STATUS = "COMPLETE";
  log.ok("Waiting line complete, you may go to the cart page.");

  return;
}
