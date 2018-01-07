const Table = require('cli-table');
const inquirer = require('inquirer');

function printToConsole(output) {
  console.log(output);
}
function createProductTable(data) {
  const table = new Table({
    head: ['Id', 'Item', 'Dept', 'Price', 'Qty'],
    colWidths: [4, 30, 10, 7, 5],
  });
  data.forEach((product) => {
    table.push([
      product.item_id,
      product.product_name,
      product.department_name,
      product.price,
      product.stock_quantity,
    ]);
  });
  return table.toString();
}

function renderProducts(data) {
  printToConsole(createProductTable(data).toString());
}

// displays transaction info
function renderTransaction(product, quantity) {
  printToConsole(`\nSuccessfully purchased ${quantity} of ${product.name} for ` +
    `$${(product.price * quantity).toFixed(2)}.`);
}

function getPurchaseInput(products) {
  return inquirer.prompt([
    {
      name: 'choice',
      type: 'input',
      message: 'Enter the ID for the item you would like to ' +
        "purchase or 'Q' to quit:",

      // ensure there is a product with entered id
      validate(input) {
        const inputInt = parseInt(input, 10);
        if (products.find(product => product.item_id === inputInt)) return true;
        if (input === 'Q') return true;
        return `${input} is not a valid choice.`;
      },
    },
    {
      name: 'quantity',
      type: 'input',
      message: 'How many?',

      // display question if user did not select quit
      when(answers) { return answers.choice !== 'Q'; },

      // quantity must be a number greater than or = 0
      validate(input) {
        return parseFloat(input) >= 0 || 'Amount must be a number greater than 0.';
      },
    },
  ]);
}
module.exports = {
  createProductTable,
  getPurchaseInput,
  printToConsole,
  renderProducts,
  renderTransaction,
};
