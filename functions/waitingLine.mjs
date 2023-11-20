import log from "./customLogs.js";

export default async function waitingLine(page, url) {
  process.env.WAITING_LINE_STATUS = "NOT_STARTED";

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

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  page.bringToFront();
  process.env.WAITING_LINE_STATUS = "STARTED";

  while (page.url().includes("/pkpcontroller/")) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // wait in case of multiple redirections
  await new Promise((resolve) => setTimeout(resolve, 3000));
  process.env.WAITING_LINE_STATUS = "COMPLETE";

  return;
}
