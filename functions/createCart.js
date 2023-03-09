import fetch from 'node-fetch'

import log from './customLogs.js'
import config from '../config.js'

async function createCart() {
	const body = [
		{
			quantity: config.TICKETS_TO_BOOK,
			performanceId: process.env.OPERA_PERF_ID,
			advantageId: process.env.OPERA_PERF_ADV_ID,
			audienceSubCategoryId: process.env.OPERA_PERF_SUB_CAT_ID,
			seatCategoryId: process.env.OPERA_PERF_SEAT_CAT_ID,
		},
	]
	await fetch('https://onp-api.operadeparis.fr/api/carts', {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.onp.v1+json',
			'Content-Type': 'application/json',
			Authorization: process.env.AUTH_TOKEN,
		},
		body: JSON.stringify(body),
	})
		.then((res) => res.json())
		.then((data) => {
			process.env.OPERA_CART_ID = data.data.cartId
		})
		.catch((err) => {
			log.err('Could not create the cart nor retrieve its id.')
			console.log(err)
			process.exit(1)
		})
}

export default createCart
