const inquirer = require('inquirer');
// const { printToConsole } = require('./customerView.js');

// returns user's chosen action. possible actions returned are as follows:
// all, low, add, new
function mainMenu() {
  const question = {
    type: 'list',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { value: 'all', name: 'View products for sale' },
      { value: 'low', name: 'View low inventory' },
      { value: 'add', name: 'Add to inventory' },
      { value: 'new', name: 'Add new product' },
      { value: 'quit', name: 'Quit' },
    ],
  };
  return inquirer.prompt(question);
}
module.exports = { mainMenu };
