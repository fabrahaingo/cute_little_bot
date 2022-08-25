import config from '../config.js'
import getJSON from 'get-json'
import striptags from 'striptags'
import inquirer from 'inquirer'

async function parseOnePerformance(elem) {
  let response = await getJSON(`${elem.link}/performances`, (error, response) => {
    if (error) {
      throw new Error(`Error while parsing ${elem.link}/performances`)
    }
    return response
  })
  if (
    response &&
    response.items[0] &&
    /Avant-première jeunes/.test(response.items[0].content.performance.mentions[0])
  ) {
    let title = striptags(elem.title).replace('&#8203;', '')
    return [title, elem.link + '/performances']
  }
  return null
}

async function getPerformancesFromVenue(venueRequestPage) {
  let response = await getJSON(venueRequestPage, async function (error, response) {
    if (error) {
      throw new Error(`Error while parsing ${venueRequestPage}`)
    }
    return response
  })
  let events = {}
  let count = 1
  let total = response.datas.length
  for (let elem of response.datas) {
    let result = await parseOnePerformance(elem)
    if (result && result[0] && result[1]) {
      events[result[0]] = result[1]
    }
    console.log(`Page ${count}/${total} scanned`)
    count++
  }
  return events
}

async function getPerformances() {
  console.log(`Scanning Garnier's performances...`)
  let events1 = await getPerformancesFromVenue(config.PERF_LIST_PAGE_GARNIER)
  console.log(`Scanning Bastille's performances...`)
  let events2 = await getPerformancesFromVenue(config.PERF_LIST_PAGE_BASTILLE)
  return Object.assign(events1, events2)
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
        process.env.OPERA_PERF_LINK = performances[answers.performance]
        resolve()
      })
  })
}

export default {
  getPerformances,
  getLink
}