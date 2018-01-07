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
function findProduct(id, products) {
  return products.find(product => product.item_id === id);
}

function renderProducts(data) {
  printToConsole(createProductTable(data).toString());
}

// displays transaction info
function renderTransaction(product, quantity) {
  printToConsole(`\nSuccessfully purchased ${quantity} of ${product.product_name} for ` +
    `$${(product.price * quantity).toFixed(2)}.`);
}

function validateChoice(choice, products) {
  // return true if user chooses to quit
  if (choice === 'Q' || choice === 'q') return true;

  // return false if choice is not a number
  if (typeof choice !== 'number') return false;

  // return message if product id not found or insufficient stock
  const productChoice = findProduct(choice, products);
  if (!productChoice) return 'Invalid item id.';
  if (productChoice.stock_quantity < 1) return 'Insufficient quantity available.';

  // valid id and quantity
  return true;
}

function validateQuantity(qty, id, products) {
  const stockQuantity = findProduct(id, products).stock_quantity;
  if (stockQuantity < qty) return 'Insufficient quantity available.';
  return qty > -1;
}

function getPurchaseInput(products) {
  return inquirer.prompt([
    {
      name: 'choice',
      type: 'input',
      message: 'Enter the ID for the item you would like to ' +
        "purchase or 'Q' to quit:",
      filter(choice) {
        const numChoice = parseInt(choice, 10);
        if (!Number.isNaN(numChoice)) return numChoice;
        if (choice.toUpperCase() === 'Q') return 'Q';
        return choice;
      },
      // ensure there is a product with entered id
      validate: filteredInput => validateChoice(filteredInput, products),
    },
    {
      name: 'quantity',
      type: 'input',
      message: 'How many?',

      filter(qty) { return parseFloat(qty); },

      // display question if user did not select quit
      when(answers) { return answers.choice !== 'Q'; },

      // quantity must be a number greater than 0 and there must be sufficient
      // stock available
      validate: (input, answers) => validateQuantity(input, answers.choice, products),
    },
  ]);
}
module.exports = {
  createProductTable,
  getPurchaseInput,
  printToConsole,
  renderProducts,
  renderTransaction,
  validateChoice,
  validateQuantity,
};
