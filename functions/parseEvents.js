import config from '../config.js'
import fetch from 'node-fetch'
import inquirer from 'inquirer'
import log from './customLogs.js'

function checkIfPast(date) {
	const now = new Date()
	const perfDate = new Date(date)
	return perfDate < now
}

async function getFormattedDate(id) {
	let perfList = await fetch(
		`https://onp-api.operadeparis.fr/api/shows/${id}/performances`,
		{
			headers: {
				Accept: 'application/vnd.onp.v1+json',
				Authorization: process.env.AUTH_TOKEN,
			},
		}
	)
	perfList = await perfList.json()
	// perfList has an array of performances stored in the "data" key
	// return true if at least one of the performances is a field called "isYouthPreview" equal to true
	const hasYouthPreview = perfList.data?.some((perf) => perf.isYouthPreview)
	if (hasYouthPreview) {
		// format the field called "date" (which is in the form of "2023-04-20 20:00:00") to get the date with format "le jour mois année à heure(h)minute"
		return perfList.data
			.filter((perf) => perf.isYouthPreview)
			.map((perf) => {
				if (checkIfPast(perf.date)) {
					return '\x1b[31mévénement passé\x1b[0m'
				}
				const date = new Date(perf.date)
				const day = date.getDate()
				const month = date.toLocaleString('fr-FR', { month: 'long' })
				const year = date.getFullYear()
				const hour = date.getHours()
				const minute = date.getMinutes()
				// handle the case where the minute is 0
				if (minute === 0) {
					return `\x1b[2m(le ${day} ${month} ${year} à ${hour}h)\x1b[0m`
				}
				return `\x1b[2m(le ${day} ${month} ${year} à ${hour}h${minute})\x1b[0m`
			})
	}
	return '\x1b[31mévénement passé ou indisponible\x1b[0m'
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
		let formattedDate = await getFormattedDate(eventId)

		events[`${title} ${formattedDate}`] = JSON.stringify({
			eventId: eventId,
			start: formattedDate,
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
}
