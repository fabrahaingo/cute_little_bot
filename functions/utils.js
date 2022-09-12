import log from './displayMessages.js'

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

function getRefreshRate(date, iterations) {
  let rate = Math.round(10 / Math.floor((Date.now() - date) / 1000) * 100) / 100
  if (iterations > 10) {
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1)
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1)
    process.stdout.cursorTo(0)
  }
  // writing in yellow
  log.dim(`Current refresh rate: ${rate} / second`)
  log.dim(`Total refreshes: ${iterations}`)
  return Date.now()
}

export default {
  delay,
  getRefreshRate
}