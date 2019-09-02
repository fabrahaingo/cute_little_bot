const inquirer = require('inquirer')

// Ask if want to use currently saved credentials
module.exports.keepCredentials = async function() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'credentials',
          message: 'Do you want to use your saved credentials ?',
          default: [ true ]     
        }
      ])
      .then(answers => {
        resolve(answers.credentials)
      })
    })
}

module.exports.getCredentials = async function() {
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