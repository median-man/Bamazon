const inquirer = require('inquirer');
const Table = require('cli-table');
const mainMenuQuestion = require('./mainMenu.js');
const { printToConsole } = require('./customerView.js');

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

function mainMenu(choices) {
  return inquirer.prompt(mainMenuQuestion(choices));
}
module.exports = { mainMenu, renderDeptSales };
