import inquirer from 'inquirer'
import log from './customLogs.js'

async function getCredentials() {
	try {
		if (!process.env.OPERA_USERNAME || !process.env.OPERA_PASSWORD) {
			log.dim('If you want to save time, run:')
			log.dim(
				'export OPERA_USERNAME=yourUsername && export OPERA_PASSWORD=yourPassword'
			)
			await inquirer
				.prompt([
					{
						type: 'input',
						name: 'username',
						message: 'Username ?',
					},
					{
						type: 'password',
						name: 'password',
						message: 'Password ?',
					},
				])
				.then((answers) => {
					process.env.OPERA_USERNAME = answers.username
					process.env.OPERA_PASSWORD = answers.password
				})
		} else {
			let response = await inquirer
				.prompt([
					{
						type: 'confirm',
						name: 'credentials',
						message: 'Do you want to use your saved credentials ?',
						default: [true],
					},
				])
				.then((answers) => {
					return answers.credentials
				})
			if (response == false) {
				await inquirer
					.prompt([
						{
							type: 'input',
							name: 'username',
							message: 'Username ?',
						},
						{
							type: 'password',
							name: 'password',
							message: 'Password ?',
						},
					])
					.then((answers) => {
						process.env.OPERA_USERNAME = answers.username
						process.env.OPERA_PASSWORD = answers.password
					})
			}
		}
	} catch (error) {
		log.err(`Error while getting your credentials: ${error.message}`)
		process.exit(1)
	}
}

export default getCredentials
