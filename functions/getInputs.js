const prompt = require('prompt-async')

async function getCredentials() {
  const prompt = require("prompt-async")
  let result = new Array()

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

  prompt.start()
  const userCredentials = await prompt.get(schema)
  result['username'] = Object.entries(userCredentials)[0][1]
  result['password'] = Object.entries(userCredentials)[1][1]
  return result
}

async function getPerformanceLink() {
  var schema = {
    properties: {
      season_year: {
        required: true
      },
      performance_type: {
        required: true
      },
      performance_name: {
         required: true
      }
    }
  }

  // FORMAT YY-YY
  // BALLET or OPERA
  // PERF_NAME (replace all ' ' by '-')
  prompt.start()
  const performance = await prompt.get(schema)
  const target_url = `https://www.operadeparis.fr/saison-${performance.season_year}/${performance.performance_type}/${performance.performance_name}/performances`
  return target_url
}

module.exports = {
  getCredentials,
  getPerformanceLink
}
