import fetch from 'node-fetch'
import log from './customLogs.js'

async function getOrderToken() {
	await fetch(
		`https://onp-api.operadeparis.fr/api/carts/${process.env.OPERA_CART_ID}`,
		{
			headers: {
				Accept: 'application/vnd.onp.v1+json',
				Authorization: process.env.AUTH_TOKEN,
			},
		}
	)
		.then((res) => res.json())
		.then((data) => {
			process.env.OPERA_ORDER_TOKEN = data.data.orderToken
		})
		.catch((err) => {
			log.err('Could not get the order token.')
			console.log(err)
			process.exit(1)
		})
}

export default getOrderToken
