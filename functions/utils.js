const player = require('play-sound')(opts = {});
const utils = require('./utils')

module.exports.delay = function (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

module.exports.beep = function () {
  player.play('beep-07.mp3', function(err){
    if (err) throw err
  })
  return
}

module.exports.getRefreshRate = function (date) {
  rate = Math.round(10 / Math.floor((Date.now() - date) / 1000) * 100) / 100
  console.log(`Refresh rate: ${rate} / second`)
  iterations = 0
  return Date.now()
}
