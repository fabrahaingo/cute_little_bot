const player = require('play-sound')(opts = {});

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function beep() {
  player.play('beep-07.mp3', function(err){
    if (err) throw err
  });
  return;
}

module.exports = {
  delay,
  beep,
};
