const inquirer = require('inquirer');
const Table = require('cli-table');
const mainMenuQuestion = require('./mainMenu.js');
const { printToConsole } = require('./customerView.js');
const {
  filterTextInput,
  isNumberGreaterOrEqual,
  validateNameInput,
} = require('./helpers.js');

function getTableString(data) {
  const table = new Table({
    head: Object.keys(data[0]),
  });

  // add each row from table. replace any falsey values with 0
  data.forEach(row => table.push(Object.values(row).map(value => value || 0)));
  console.log(table)
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

function getOverheadCosts() {
  return inquirer.prompt({
    type: 'input',
    message: 'Enter over head cost or C to cancel',
    name: 'overHeadCost',
    filter(quantity) {
      if (quantity.toLowerCase() === 'c') return 'C';
      return Math.round(parseFloat(quantity, 10));
    },
    validate: input => isNumberGreaterOrEqual(input, 0),
  }).then(answer => answer.overHeadCost);
}

function getNewDept() {
  const res = { name: '', over_head_costs: 0 };
  return getDeptName()
    .then((nameInput) => {
      if (nameInput === 'C') return false;
      res.name = nameInput;
      return getOverheadCosts();
    })
    .then((costInput) => {
      if (!costInput || costInput === 'C') return false;
      res.over_head_costs = costInput;
      return res;
    });
}

function mainMenu(choices) {
  return inquirer.prompt(mainMenuQuestion(choices));
}
module.exports = {
  getNewDept, mainMenu, printToConsole, renderDeptSales,
};
