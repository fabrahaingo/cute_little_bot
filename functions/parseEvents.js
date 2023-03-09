import config from '../config.js'
import fetch from 'node-fetch'
import inquirer from 'inquirer'
import log from './customLogs.js'

// Exemple of string returned by the API: "du 23 janv. au 24 févr. 2023"
// we extract the number, month and year then get timestamp
function getOpeningTimestamp(str) {
	const monthTable = {
		'janv.': 'jan',
		'févr.': 'feb',
		mars: 'mar',
		avril: 'april',
		mai: 'may',
		juin: 'june',
		'juil.': 'july',
		août: 'aug',
		'sept.': 'sept',
		'oct.': 'oct',
		'nov.': 'nov',
		'déc.': 'dec',
	}
	const words = str.split(' ')
	let day = undefined
	let month = undefined
	let year = undefined

	// we loop through the words to find the day, month and year
	for (let i = 0; i < words.length; i++) {
		if (
			day === undefined &&
			month === undefined &&
			Number(words[i]) > 0 &&
			Number(words[i]) < 2000
		) {
			day = words[i]
			month = monthTable[words[i + 1]]
		}
		if (Number(words[i]) > 2000) {
			year = words[i]
		}
	}

	let date = new Date(`${day} ${month} ${year}`)
	const offset = date.getTimezoneOffset()
	date = new Date(date.getTime() - offset * 60 * 1000)
	return date.toISOString().split('T')[0]
}

async function getPerformances() {
	log.dim('Parsing performances...')
	let APIevents = []
	try {
		APIevents = await fetch(config.PERF_LIST_PAGE)
		APIevents = await APIevents.json()
	} catch (error) {
		log.err(`Error while parsing performances: ${error.message}`)
	}

	let events = {}
	for (let elem of APIevents.datas) {
		// Get title and remove all HTML tags when needed
		let title = elem.title.replace(/(<([^>]+)>)/gi, '')
		// Build performances URLs
		let eventId = elem.id
		let eventDate = getOpeningTimestamp(elem.start_end_dates)
		let formattedDate = new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
		}).format(new Date(eventDate))

		events[`${title} - ${formattedDate}`] = JSON.stringify({
			eventId: eventId,
			start: eventDate,
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
					choices: Object.keys(performances),
				},
			])
			.then((answer) => {
				process.env.OPERA_EVENT_ID = JSON.parse(
					performances[answer.performance]
				).eventId
				process.env.OPERA_PERF_DATE = JSON.parse(
					performances[answer.performance]
				).start
				resolve()
			})
	})
}

export default {
	getPerformances,
	getLink,
	getOpeningTimestamp,
}
