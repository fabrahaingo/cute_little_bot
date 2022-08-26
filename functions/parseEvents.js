import config from '../config.js'
import getJSON from 'get-json'
import striptags from 'striptags'
import inquirer from 'inquirer'

// async function parseOnePerformance(elem) {
//   let response = await getJSON(`${elem.link}/performances`, (error, response) => {
//     if (error) {
//       throw new Error(`Error while parsing ${elem.link}/performances`)
//     }
//     return response
//   })
//   if (
//     response &&
//     response.items[0] &&
//     /Avant-première jeunes/.test(response.items[0].content.performance.mentions[0])
//   ) {
//     let title = striptags(elem.title).replace('&#8203;', '')
//     return [title, elem.link + '/performances']
//   }
//   return null
// }

async function getPerformances() {
  console.log(`Scanning Avant-Première performances...`)
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

    let result = [title, perfURL]
    events[result[0]] = result[1]
  }
  console.log('All Avant-Première retrieved ✅')
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
        process.env.OPERA_PERF_LINK = performances[answers.performance]
        resolve()
      })
  })
}

export default {
  getPerformances,
  getLink
}