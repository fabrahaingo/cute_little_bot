import puppeteer from "puppeteer";
import log from "./customLogs.js";

async function openBrowserAndSetCookies() {
  const browser = await puppeteer
    .launch({
      headless: false,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    })
    .catch((err) => {
      log.err("Error while launching browser");
      console.log(err);
      process.exit(1);
    });

  const pages = await browser.pages();
  const page = pages[0];

  if (
    !process.env.OPERA_SESSION_TOKEN_NAME ||
    !process.env.OPERA_SESSION_TOKEN_VALUE
  ) {
    log.err("Missing token name and/or token value before setting the cookie.");
    process.exit(1);
  }

  await page
    .setCookie({
      name: process.env.OPERA_SESSION_TOKEN_NAME,
      value: process.env.OPERA_SESSION_TOKEN_VALUE,
      domain: "mobile.operadeparis.fr",
    })
    .catch((err) => {
      log.err("Error while setting cookie");
      console.log(err);
      process.exit(1);
    });

  return page;
}

export default openBrowserAndSetCookies;
