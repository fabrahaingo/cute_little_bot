function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

function getRefreshRate(date) {
  let rate = Math.round(10 / Math.floor((Date.now() - date) / 1000) * 100) / 100
  console.log(`Refresh rate: ${rate} / second`)
  return Date.now()
}

export default {
  delay,
  getRefreshRate
}