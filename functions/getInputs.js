import inquirer from 'inquirer'

// Ask if want to use currently saved credentials
async function keepCredentials() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'credentials',
          message: 'Do you want to use your saved credentials ?',
          default: [true]
        }
      ])
      .then(answers => {
        resolve(answers.credentials)
      })
  })
}

async function getCredentials() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Username ?'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password ?'
        }
      ])
      .then(answers => {
        process.env.OPERA_USERNAME = answers.username
        process.env.OPERA_PASSWORD = answers.password
        resolve()
      })
  })
}

export default {
  keepCredentials,
  getCredentials
}