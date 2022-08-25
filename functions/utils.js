import player from 'play-sound'

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

function beep() {
  player.play('beep-07.mp3', function (err) {
    if (err) throw err
  })
  return
}

function getRefreshRate(date) {
  rate = Math.round(10 / Math.floor((Date.now() - date) / 1000) * 100) / 100
  console.log(`Refresh rate: ${rate} / second`)
  iterations = 0
  return Date.now()
}

export default {
  delay,
  beep,
  getRefreshRate
}