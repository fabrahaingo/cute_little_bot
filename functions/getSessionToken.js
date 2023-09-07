import fetch from 'node-fetch'
import log from './customLogs.js'

async function getSessionToken() {
	// create auth token
	process.env.AUTH_TOKEN =
		'Basic ' +
		Buffer.from(
			process.env.OPERA_USERNAME + ':' + process.env.OPERA_PASSWORD
		).toString('base64')

	await fetch('https://onp-api.operadeparis.fr/api/sessions', {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.onp.v1+json',
			Authorization: process.env.AUTH_TOKEN,
		},
	})
		.then((res) => res.json())
		.then((data) => {
			process.env.OPERA_SESSION_TOKEN_NAME = data.data.name
			process.env.OPERA_SESSION_TOKEN_VALUE = data.data.value
		})
		.catch((err) => {
			log.err('Error while getting session token')
			console.log(err)
			process.exit(1)
		})
}

export default getSessionToken
