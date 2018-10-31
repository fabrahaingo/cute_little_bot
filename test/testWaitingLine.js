const puppeteer = require('puppeteer');
(async() => {
const browser = await puppeteer.launch({
	headless: false
});
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', request => {
	if (request.resourceType() === 'script')
		request.abort();
	else
		request.continue();
	});
	await page.goto('http://access.operadeparis.fr/pkpcontroller/wp/opera/index_fr.html');
	await page.evaluate(() => {
		return Promise.resolve(showAdmissionLink());
	});
	
	//await browser.close();
})();
