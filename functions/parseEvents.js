import config from '../config.js'
import getJSON from 'get-json'
import inquirer from 'inquirer'
import log from './displayMessages.js'

// Exemple of string returned by the API: "du 23 janv. au 24 févr. 2023"
// we extract the number, month and year then get timestamp
function getStartTimestamp(str) {
  const monthTable = {
    'janv.': 'jan',
    'févr.': 'feb',
    'mars': 'mar',
    'avril': 'april',
    'mai': 'may',
    'juin': 'june',
    'juil.': 'july',
    'août': 'aug',
    'sept.': 'sept',
    'oct.': 'oct',
    'nov.': 'nov',
    'déc.': 'dec'
  }
  const words = str.split(' ')
  const day = words[1]
  const month = monthTable[words[2]]
  const year = words[words.length - 1]
  let date = new Date(`${day} ${month} ${year}`)
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset * 60 * 1000))
  return date.toISOString().split('T')[0]
}

async function getPerformances() {
  log.dim('Parsing performances...')
  let response = await getJSON(config.PERF_LIST_PAGE, async function (err, res) {
    if (err)
      throw new Error(`Error while parsing ${config.PERF_LIST_PAGE}`)
    return res
  })
  let events = {}
  for (let elem of response.datas) {
    // Get title and remove all HTML tags when needed
    let title = elem.title.replace(/(<([^>]+)>)/gi, "")
    // Build performances URLs
    let perfURL = `${elem.link}/performances`
    let startDate = getStartTimestamp(elem.start_end_dates)

    events[title] = JSON.stringify({
      url: perfURL,
      start: startDate
    })
  }
  log.ok('All Avant-Première retrieved\n')
  return events
}

async function getLink(performances) {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'performance',
          message: 'Which performance do you want ?',
          choices: Object.keys(performances)
        }
      ])
      .then((answers) => {
        process.env.OPERA_PERF_LINK = JSON.parse(performances[answers.performance]).url
        process.env.OPERA_PERF_DATE = JSON.parse(performances[answers.performance]).start
        resolve()
      })
  })
}

export default {
  getPerformances,
  getLink,
  getStartTimestamp
}