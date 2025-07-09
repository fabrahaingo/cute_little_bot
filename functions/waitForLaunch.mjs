import moment from "moment";
import config from "../config.js";
import log from "./customLogs.js";

export default async function waitForLaunch() {
  let endTime = moment()
    .startOf("day")
    .hour(config.START_TIME.HOURS ?? 12)
    .minute(config.START_TIME.MINUTES ?? 0)
    .second(config.START_TIME.SECONDS ?? 0);
  let startTime = endTime.subtract(config.OPENING_WAIT, "seconds");
  let timeLeft = moment.duration(endTime.diff(moment()));
  if (timeLeft.hours() < -1) {
    log.rm();
    log.err(
      `You missed ${endTime.hour()}h (opening hour) by ${timeLeft.hours()} hours. Please try again another day.`
    );
    process.exit(1);
  }

  while (moment() < startTime) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    timeLeft = moment.duration(endTime.diff(moment()), "milliseconds");
    log.rm();
    log.warn(
      `Program will start in ${
        timeLeft.hours() ? `${timeLeft.hours()} h ` : ""
      }${
        timeLeft.minutes() ? `${timeLeft.minutes()} min and ` : ""
      }${timeLeft.seconds()} sec`
    );
  }

  log.rm();
  log.ok("Starting to refresh");
  return;
}
