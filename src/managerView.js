const inquirer = require('inquirer');
const { findProduct, printToConsole, renderProducts } = require('./customerView.js');

function precisionRound(number, precision) {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

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
  let result = '';
  let {
    item_id: id,
    product_name: prodName,
    stock_quantity: stock,
    department_name: dept,
    price,
  } = product;
  // format strings for each value to display
  id = id ? padStart(id, 3) : false;
  prodName = toFixedLength(prodName, 14);
  dept = toFixedLength(dept, 5);
  stock = padStart(stock, 4);
  price = padStart(price, 7);
  // string to display in the list
  result = `${prodName} | ${dept} | ${stock} | ${price}`;
  return id ? `${id} | ${result}` : result;
  // return `${id} | ${prodName} | ${dept} | ${stock} | ${price}`;
}

function getProductList(products) {
  return products.map(product => ({
    value: product.item_id,
    name: createListItem(product),
  }));
}

function validateName(input, maxLength) {
  if (input.toUpperCase() === 'C') return true;
  if (!/[a-z]/i.test(input)) return 'Input must contain a letter.';
  if (input.length < 2) return 'Must have at least 2 characters';
  if (input.length > maxLength) return `Must contain ${maxLength} or fewer characters.`;
  return true;
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

function getItemName() {
  return inquirer.prompt({
    type: 'input',
    name: 'product_name',
    message: 'Enter the product name or C to cancel',
    validate: input => validateName(input, 35),
    filter(input) {
      if (input.toUpperCase() === 'C') return 'C';
      return input;
    },
  });
}

function getDepartmentName() {
  return inquirer.prompt({
    type: 'input',
    name: 'department_name',
    message: 'Enter the department name or C to cancel',
    filter(input) {
      if (input.toUpperCase() === 'C') return 'C';
      return input;
    },
    validate: input => validateName(input, 15),
  });
}

function getPrice() {
  return inquirer.prompt({
    type: 'input',
    name: 'price',
    message: 'Enter the price or C to cancel',
    filter(input) {
      if (input.toUpperCase() === 'C') return 'C';
      const price = parseFloat(input, 10);
      return precisionRound(price, 2);
    },
    validate(input) {
      if (Number.isNaN(input)) return 'Enter a number';
      if (input < 0) return 'Cannot be negative.';
      return true;
    },
  });
}

function getQuantity() {
  return inquirer.prompt({
    type: 'input',
    name: 'stock_quantity',
    message: 'Enter new quantity or C to cancel',
    filter(quantity) {
      if (quantity.toLowerCase() === 'c') return 'C';
      return parseFloat(quantity, 10);
    },
    validate(quantity) {
      if (quantity === 'C') return true;
      if (Number.isNaN(quantity)) return 'Invalid choice';
      if (quantity < 0) return 'Quantity must be >= 0';
      return true;
    },
  });
}

function getConfirm(message) {
  return inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message,
  });
}

function addProduct(product = {}, cancel) {
  // handleResponse calls addProduct with cancel = true if user cancels. Else, calls
  // addProduct after adding input to product object
  const handleResponse = (answers) => {
    if (Object.values(answers).includes('C')) return addProduct(null, true);
    Object.assign(product, answers);
    return addProduct(product);
  };

  // resolves to false if user cancels
  if (cancel) return Promise.resolve(false);

  // get user input for each property
  if (typeof product.product_name === 'undefined') {
    return getItemName().then(handleResponse);
  }
  if (typeof product.department_name === 'undefined') {
    return getDepartmentName().then(handleResponse);
  }
  if (typeof product.price === 'undefined') {
    return getPrice().then(handleResponse);
  }
  if (typeof product.stock_quantity === 'undefined') {
    return getQuantity().then(handleResponse);
  }

  // get confirmation from user and resolve promise if user confirms
  const confirmationText = 'Add the following product?:\n' +
    `  ${Object.values(product).join(' | ')}\n`;

  return getConfirm(confirmationText)
    .then((answers) => {
      if (answers.confirm) return Promise.resolve(product);
      return addProduct(null, true);
    });
}

function renderInventoryUpdate(product) {
  renderProducts([product]);
  printToConsole('Item succesfully updated!');
}
module.exports = {
  addInventory,
  addProduct,
  getProductList,
  mainMenu,
  renderInventoryUpdate,
  validateName,
  validateQuantity,
};
