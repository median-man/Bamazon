const inquirer = require('inquirer');
const Table = require('cli-table');
const mainMenuQuestion = require('./mainMenu.js');
const { printToConsole } = require('./customerView.js');
const { filterTextInput, validateNameInput } = require('./helpers.js');

function getTableString(data) {
  const table = new Table({
    head: Object.keys(data[0]),
  });
  data.forEach(row => table.push(Object.values(row)));
  return table.toString();
}

// Render table for department sales and profits
function renderDeptSales(data) {
  printToConsole(getTableString(data));
}

function getDeptName() {
  return inquirer.prompt({
    type: 'input',
    message: 'Enter department name or C to cancel',
    name: 'deptName',
    validate: input => validateNameInput(input, 15),
    filter: filterTextInput,
  }).then(answer => answer.deptName);
}

function mainMenu(choices) {
  return inquirer.prompt(mainMenuQuestion(choices));
}
module.exports = { getDeptName, mainMenu, renderDeptSales };
