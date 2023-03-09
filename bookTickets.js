import puppeteer from 'puppeteer'
import config from './config.js'
import inquirer from 'inquirer'
import moment from 'moment'
import 'moment-timezone'

import event from './functions/parseEvents.js'
import log from './functions/customLogs.js'
import getPerfId from './functions/getPerfId.js'
import getSessionToken from './functions/getSessionToken.js'
import refreshUntilTicketsAvailable from './functions/refreshUntilTicketsAvailable.js'
import createCart from './functions/createCart.js'
import getOrderToken from './functions/getOrderToken.js'
import openCartPage from './functions/openCartPage.js'
import getCredentials from './functions/getCredentials.js'
// import getPreferedSeats from './functions/getPreferedSeats.js'

async function wait(amountMs) {
	return new Promise((resolve) => setTimeout(resolve, amountMs))
}

async function waitForLaunch() {
	let endTime = moment().startOf('day').hour(12).minute(0)
	let startTime = endTime.subtract(config.OPENING_WAIT, 'seconds')
	let timeLeft = moment.duration(endTime.diff(startTime))
	if (timeLeft.hours() < 0) {
		log.rm()
		log.err(
			`You missed ${endTime.hour()}h (opening hour). Please try again another day.`
		)
		process.exit(1)
	}

	while (endTime.diff(moment()) > config.OPENING_WAIT * 1000) {
		// wait for 1 second in nodejs
		await wait(1000)
		timeLeft = moment.duration(startTime.diff(moment()), 'milliseconds')
		log.rm()
		// writing in yellow
		log.warn(
			`Program will start in ${
				timeLeft.hours() ? `${timeLeft.hours()} h ` : ''
			}${
				timeLeft.minutes() ? `${timeLeft.minutes()} min and ` : ''
			}${timeLeft.seconds()} sec`
		)
	}

	log.rm()
	log.ok('Starting to refresh')
	return
}

async function getAndSelectPerf() {
	try {
		log.dim('Getting avant-premières of 22-23 season...')
		let performances = await event.getPerformances()
		await event.getLink(performances)
	} catch (error) {
		console.log(error)
		log.err(`Error while parsing performance pages: ${error.message}`)
		process.exit(1)
	}
}

async function openBrowserAndSetCookie() {
	const browser = await puppeteer
		.launch({
			headless: false,
			defaultViewport: null,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
		})
		.catch((err) => {
			log.err('Error while launching browser')
			console.log(err)
			process.exit(1)
		})
	const pages = await browser.pages()
	const page = pages[0]
	await page
		.setCookie({
			name: process.env.OPERA_SESSION_TOKEN_NAME,
			value: process.env.OPERA_SESSION_TOKEN_VALUE,
			domain: 'mobile.operadeparis.fr',
		})
		.catch((err) => {
			log.err('Error while setting cookie')
			console.log(err)
			process.exit(1)
		})
	return page
}

;(async () => {
	try {
		// Get avant-premiere links
		await getAndSelectPerf()
		// Either ask for credentials or use saved ones
		await getCredentials()
		// Get the perfId of the performance we want to book
		await getPerfId()

		//! Change perfId for testing
		//! process.env.OPERA_PERF_ID = '10228308688210'
		//! process.env.OPERA_PERF_ID = '10228308838081'

		// Get the session token needed to access the cart page
		await getSessionToken()
		// open browser + set cookie in advance to save time
		const page = await openBrowserAndSetCookie()
		// Wait for the opening to avoid spamming the server
		await waitForLaunch()
		// Wait for tickets to be available
		await refreshUntilTicketsAvailable()
		// Create the cart + add the tickets, then get the cartId
		await createCart()
		// Get the orderToken
		await getOrderToken()
		// Open the cart page which will redirect to the billeterie subdomain
		await openCartPage(page)
		// Get the prefered seats
		// await getPreferedSeats(page)
	} catch (err) {
		console.log(err)
		log.err('Error while booking tickets, please try again.')
		process.exit(1)
	}
})()
