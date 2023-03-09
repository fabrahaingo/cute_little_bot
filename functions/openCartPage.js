import log from './customLogs.js'

async function openCartPage(page) {
	log.dim(`If an error occurs, here is the cart URL:`)
	log.dim(
		`https://mobile.operadeparis.fr/api/1/redirect/checkout?orderId=${process.env.OPERA_CART_ID}&orderToken=${process.env.OPERA_ORDER_TOKEN}`
	)

	page.bringToFront()
	await page
		.goto(
			`https://mobile.operadeparis.fr/api/1/redirect/checkout?orderId=${process.env.OPERA_CART_ID}&orderToken=${process.env.OPERA_ORDER_TOKEN}`,
			{ waitUntil: 'networkidle2' }
		)
		.catch((err) => {
			log.err('Could not go to the cart page.')
			console.log(err)
			process.exit(1)
		})

	// wait for div called ".axeptio_mount" to appear then hide it
	await page.waitForSelector('.axeptio_mount', { timeout: 0 }).catch((err) => {
		log.err('Could not find the cookie banner.')
		console.log(err)
	})
	await page
		.evaluate(() => {
			document.querySelector('.axeptio_mount').style.display = 'none'
		})
		.catch((err) => {
			log.err('Could not hide the cookie banner.')
			console.log(err)
			process.exit(1)
		})
}

export default openCartPage
