const config = require('../config.js')
const getJSON = require('get-json')
const striptags = require('striptags')
const inquirer = require('inquirer')

async function parseOnePerformance(elem) {
  response = await getJSON(`${elem.link}/performances`, (error, response) => {
    if (error) {
      throw new Error(`Error while parsing ${elem.link}/performances`)
    }
    return response
  })
  if (response && response.items[0] && response.items[0].content.performance.mentions[0] == 'Avant-première jeunes (-28 ans)') {
    let title = striptags(elem.title).replace('&#8203;', '')
    return [title, elem.link + '/performances']
  }
  return null
}

async function getPerformancesFromVenue(venueRequestPage) {
  response = await getJSON(venueRequestPage, async function(error, response){
    if (error) {
      throw new Error(`Error while parsing ${venueRequestPage}`)
    }
    return response
  })
  let events = {}
  for (let elem of response.datas) {
    result = await parseOnePerformance(elem)
    if (result && result[0] && result[1]) {
      events[result[0]] = result[1]
    }
  }
  return events
}

module.exports.getPerformances = async function() {
  let events1 = await getPerformancesFromVenue(config.PERF_LIST_PAGE_GARNIER)
  let events2 = await getPerformancesFromVenue(config.PERF_LIST_PAGE_BASTILLE)
  return Object.assign(events1, events2)
}

module.exports.getLink = async function(performances) {
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
      .then(answers => {
        process.env.OPERA_PERF_LINK = performances[answers.performance]
        resolve()
      })
    })
}