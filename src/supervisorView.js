const inquirer = require('inquirer');
const mainMenuQuestion = require('./mainMenu.js');

function mainMenu(choices) {
  return inquirer.prompt(mainMenuQuestion(choices));
}
module.exports = { mainMenu };
