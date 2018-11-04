async function getCredentials() {
  const prompt = require("prompt-async");
  let result = new Array();

  var schema = {
    properties: {
      username: {
        required: true
      },
      passsword: {
        hidden: true,
        required: true
      }
    }
  }

  // Start prompt
  prompt.start();
  const userCredentials = await prompt.get(schema);
  result['username'] = Object.entries(userCredentials)[0][1];
  result['password'] = Object.entries(userCredentials)[1][1];
  return result;
}

async function getCapcha() {
  const prompt = require("prompt-async");
  let result = new Array();

  var schema = {
    properties: {
      capcha: {
        required: true
      }
    }
  }

  // Start prompt
  prompt.start();
  const userCapcha = await prompt.get(schema);
  result['capcha'] = Object.entries(userCredentials)[0][1];
  return result;
}

module.exports = {
  getCredentials,
};
