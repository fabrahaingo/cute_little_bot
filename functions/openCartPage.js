import log from "./customLogs.js";

// function that allows for the page to not contain "attente" in its title and that checks it every 5 seconds
async function checkIfWaitIsOver(page) {
  let title = await page.title();
  if (title.includes("attente")) {
    while (title.includes("attente")) {
      title = await page.title();
      log.dim("Waiting for the waiting line to be finished...");
      await page.waitForTimeout(2000);
    }
    log.ok("Wait is over, redirecting to cart!");
  }
  return;
}

async function openCartPage(page) {
  log.dim(`If an error occurs, here is the cart URL:`);
  log.dim(
    `https://mobile.operadeparis.fr/api/1/redirect/checkout?orderId=${process.env.OPERA_CART_ID}&orderToken=${process.env.OPERA_ORDER_TOKEN}`
  );

  page.bringToFront();

  await checkIfWaitIsOver(page);

  page.bringToFront();

  await page
    .goto(
      `https://mobile.operadeparis.fr/api/1/redirect/checkout?orderId=${process.env.OPERA_CART_ID}&orderToken=${process.env.OPERA_ORDER_TOKEN}`,
      { waitUntil: "networkidle2" }
    )
    .catch((err) => {
      log.err("Could not go to the cart page.");
      console.log(err);
      process.exit(1);
    });
}

export default openCartPage;
