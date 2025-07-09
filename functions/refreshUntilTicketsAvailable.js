import fetch from "node-fetch";
import log from "./customLogs.js";
import config from "../config.js";

async function extractDetails(obj) {
  process.env.OPERA_PERF_SUB_CAT_ID =
    obj.data.categories[0].audienceSubCategoryId;
  process.env.OPERA_PERF_SEAT_CAT_ID = obj.data.categories[0].seatCategory.id;

  // Get advantageId
  //? As of February 12th 2023, I don't know where to find the advantageId
  //? Therefore this might need to be updated
  if (obj.data.categories[0].advantageId) {
    process.env.OPERA_PERF_ADV_ID = obj.data.categories[0].advantageId;
  } else if (typeof obj.data.categories[0].advantage === "string") {
    process.env.OPERA_PERF_ADV_ID = obj.data.categories[0].advantage;
  } else if (obj.data.categories[0].advantage?.id) {
    process.env.OPERA_PERF_ADV_ID = obj.data.categories[0].advantage.id;
  } else {
    process.env.OPERA_PERF_ADV_ID = "";
  }
}

async function refreshUntilTicketsAvailable() {
  let perfStatusCode = 0;
  let i = 0;
  let perf_details = null;
  while (perfStatusCode != 200) {
    perfStatusCode = await fetch(
      `https://onp-api.operadeparis.fr/api/performances/${
        config.SPECIFIC_PERF_ID ?? process.env.OPERA_PERF_ID
      }/prices`,
      {
        headers: {
          Accept: "application/vnd.onp.v1+json",
          Authorization: process.env.AUTH_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.data?.categories[0]?.seatsAvailability === 0) {
          log.err("This performance is unfortunately sold out.");
          process.exit(1);
        } else {
          log.dim(
            `There are still ${data.data?.categories[0]?.seatsAvailability} tickets available.`
          );
        }
        perf_details = data;
        return data.status_code;
      })
      .catch(async (err) => {
        log.err("Error while getting performance details... retrying in 1s");
        console.log(err.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return 400;
      });
    log.rm();
    if (i > 0) {
      log.rm();
    }
    log.dim(`Waiting for tickets to be available... (refreshes: ${i})`);
    i++;
  }
  log.rm();
  extractDetails(perf_details);
}

export default refreshUntilTicketsAvailable;
