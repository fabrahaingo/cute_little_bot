import config from "../config.js";
import log from "./customLogs.js";

// 1. Retrieve the current cart from the API
// 2. Check when it expires. If it expires in less than 2 minutes, we refresh it
// 3. Refresh it by adding the same tickets again, but in another order
// 4. Wait for response to confirm that cart was refreshed successfully

async function getCurrentCart() {
  const cartRes = await fetch(
    `https://onp-api.operadeparis.fr/api/carts/${process.env.OPERA_CART_ID}`,
    {
      headers: {
        Accept: "application/vnd.onp.v1+json",
        Authorization: process.env.AUTH_TOKEN,
      },
    }
  ).catch((err) => {
    log.err("Could not retrieve current cart.");
    console.log(err);
  });

  const json = await cartRes.json();
  return json;
}

async function swapTickets(ticket1, ticket2) {
  const res = await fetch(
    `https://onp-api.operadeparis.fr/api/carts/${process.env.OPERA_CART_ID}/performances`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.onp.v1+json",
        "Content-Type": "application/json",
        Authorization: process.env.AUTH_TOKEN,
      },
      body: JSON.stringify({
        physicalSeats: [
          { id: ticket2.id, operationId: ticket2.operationId },
          { id: ticket1.id, operationId: ticket1.operationId },
        ],
        audienceSubCategoryId: process.env.OPERA_PERF_SUB_CAT_ID,
        seatCategoryId: process.env.OPERA_PERF_SEAT_CAT_ID,
        performanceId: config.SPECIFIC_PERF_ID ?? process.env.OPERA_PERF_ID,
      }),
    }
  ).catch((err) => {
    log.err("Could not swap tickets.");
    console.log(err);
  });

  const json = await res.json();
  return json;
}

async function refreshCart() {
  const cart = await getCurrentCart();

  const expirationDate = new Date(cart.data.expirationDate);
  const now = new Date();
  const diff = expirationDate - now;
  const diffInMinutes = Math.round(diff / 60000);

  if (diffInMinutes > 3) {
    log.dim(
      `Cart expires in ${diffInMinutes} minutes. Will re-check in 5 seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return;
  }

  const ticket1 = cart.data.performances[0].categories[0].tickets[0];
  const ticket2 = cart.data.performances[0].categories[0].tickets[1];

  await swapTickets(ticket1, ticket2)
    .then((res) => {
      if (res.status_code === 200) {
        log.ok("Cart refreshed successfully.");
      } else {
        log.err("Could not refresh the cart.");
      }
    })
    .catch((err) => {
      log.err("Could not refresh the cart.");
      console.log(err);
    });
}

export default refreshCart;
