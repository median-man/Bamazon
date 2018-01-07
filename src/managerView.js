const inquirer = require('inquirer');
const { findProduct } = require('./customerView.js');

function padStart(value, len) {
  let result = value;
  if (typeof result !== 'string') result = result.toString();
  if (result.length >= len) return result;
  result = ' '.repeat(len - result.length) + result;
  return result;
}
function padEnd(value, len) {
  let result = value;
  if (typeof result !== 'string') result = result.toString();
  if (result.length >= len) return result;
  result += ' '.repeat(len - result.length);
  return result;
}

function toFixedLength(str, len) {
  let result = str;
  if (result.length > len) result = result.substr(0, len);
  else result = padEnd(result, len);
  return result;
}

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

function createListItem(product) {
  let {
    item_id: id,
    product_name: prodName,
    stock_quantity: stock,
    department_name: dept,
    price,
  } = product;
  // format strings for each value to display
  id = padStart(id, 3);
  prodName = toFixedLength(prodName, 14);
  dept = toFixedLength(dept, 5);
  stock = padStart(stock, 4);
  price = padStart(price, 7);
  // string to display in the list
  return `${id} | ${prodName} | ${dept} | ${stock} | ${price}`;
}

function getProductList(products) {
  return products.map(product => ({
    value: product.item_id,
    name: createListItem(product),
  }));
}

function validateQuantity(quantity) {
  if (quantity < 0 || Number.isNaN(quantity)) return 'Invalid amount';
  return true;
}

// Add inventory returns user input for updating the stock quantity of an item
// it returns a promise which resolves to an object with an object with id and newQuantity
// or else it resolves to false
function addInventory(products) {
  const questions = [
    {
      type: 'list',
      name: 'id',
      message: 'Choose a product to edit inventory',
      choices: getProductList(products).concat(['cancel']),
    },
    {
      type: 'input',
      name: 'newQuantity',
      message: 'Enter new quantity or C to cancel',
      when({ id }) { return id !== 'cancel'; },
      filter(quantity) {
        if (quantity.toLowerCase() === 'c') return 'cancel';
        return parseFloat(quantity, 10);
      },
      validate(quantity) {
        if (quantity === 'cancel') return true;
        if (Number.isNaN(quantity)) return 'Invalid choice';
        if (quantity < 0) return 'Quantity must be >= 0';
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'confirm',
      when: ({ id, newQuantity }) => (id !== 'cancel' && newQuantity !== 'cancel'),
      message: ({ id, newQuantity }) =>
        `Set inventory of ${findProduct(id, products).product_name} to ${newQuantity}`,
    },
  ];
  return inquirer
    .prompt(questions)
    .then(({ id, newQuantity, confirm }) => {
      if (newQuantity === 'cancel' || id === 'cancel') return false;
      if (!confirm) return addInventory(products);
      return { id, newQuantity };
    });
}
module.exports = {
  addInventory, getProductList, mainMenu, validateQuantity,
};
