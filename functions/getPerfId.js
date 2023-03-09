import fetch from 'node-fetch'

import log from './customLogs.js'
async function getPerfId() {
	process.env.AUTH_TOKEN =
		'Basic ' +
		Buffer.from(
			process.env.OPERA_USERNAME + ':' + process.env.OPERA_PASSWORD
		).toString('base64')
	let event_details = await fetch(
		`https://onp-api.operadeparis.fr/api/shows/${process.env.OPERA_EVENT_ID}/performances`,
		{
			headers: {
				Accept: 'application/vnd.onp.v1+json',
				Authorization: process.env.AUTH_TOKEN,
			},
		}
	)
		.then((res) => res.json())
		.catch((err) => {
			log.err('Error while getting performances')
			console.log(err)
		})
	switch (event_details.status_code) {
		case 401:
			log.err('Invalid credentials')
			process.exit(1)
		case 404:
			log.err('Event not found')
			process.exit(1)
		default:
			break
	}
	for (let perf of event_details?.data) {
		if (perf.isYouthPreview) {
			process.env.OPERA_PERF_ID = perf?.performanceId
			return
		}
	}
	log.err(`No avant-première found for this event`)
	process.exit(1)
}

// export function
export default getPerfId
