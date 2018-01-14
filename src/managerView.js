const inquirer = require('inquirer');
const { findProduct, printToConsole, renderProducts } = require('./customerView.js');
const mainMenuQuestion = require('./mainMenu.js');
const { validateNameInput } = require('./helpers.js');

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
}

// Accepts a department object or id and name parameters.
// Returns a formatted string.
function deptToString(dept, name) {
  const separator = ' | ';
  let values;
  if (typeof dept === 'object') {
    values = Object.values(dept);
    values[2] = `$${padStart(values[2], 6)}`;
  } else {
    values = [dept, name];
  }
  values[0] = padStart(values[0], 3);
  values[1] = toFixedLength(values[1], 15);
  return values.join(separator);
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

function getItemName() {
  return inquirer.prompt({
    type: 'input',
    name: 'product_name',
    message: 'Enter the product name or C to cancel',
    validate: input => validateNameInput(input, 35),
    filter(input) {
      if (input.toUpperCase() === 'C') return 'C';
      return input;
    },
  });
}

function getDepartmentName(departments) {
  return inquirer.prompt({
    type: 'list',
    name: 'department_name',
    message: 'Select the department',
    choices: departments.map(dept => ({
      name: deptToString(dept.department_id, dept.name),
      value: dept.name,
    })).concat({ name: 'Cancel', value: 'C' }),
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

function getProductId(products) {
  return inquirer
    .prompt({
      type: 'list',
      name: 'id',
      message: 'Choose a product to edit inventory',
      choices: getProductList(products).concat(['cancel']),
      filter(input) {
        if (input === 'cancel') return 'C';
        return input;
      },
    })
    .then(answers => answers.id);
}

// Add inventory returns user input for updating the stock quantity of an item
// it returns a promise which resolves to an object with an id and newQuantity
// or else it resolves to false if the user cancels
function addInventory(products, input, cancel) {
  if (cancel) return false;
  if (!input) {
    return getProductId(products)
      .then((id) => {
        if (id === 'C') return addInventory(null, null, true);
        return addInventory(products, { id });
      });
  }
  if (!input.newQuantity) {
    return getQuantity()
      .then(({ stock_quantity: newQuantity }) => {
        if (newQuantity === 'C') return addInventory(null, null, true);
        Object.assign(input, { newQuantity });
        return addInventory(products, input);
      });
  }
  const { id, newQuantity } = input;
  const message = `Set inventory of ${findProduct(id, products).product_name} to ${newQuantity}`;
  return getConfirm(message)
    .then(({ confirm }) => {
      if (confirm) return input;
      return false;
    });
}

function addProduct(departments, product = {}, cancel) {
  // handleResponse calls addProduct with cancel = true if user cancels. Else, calls
  // addProduct after adding input to product object
  const handleResponse = (answers) => {
    if (Object.values(answers).includes('C')) return addProduct(departments, null, true);
    Object.assign(product, answers);
    return addProduct(departments, product);
  };

  // resolves to false if user cancels
  if (cancel) return Promise.resolve(false);

  // get user input for each property
  if (typeof product.product_name === 'undefined') {
    return getItemName().then(handleResponse);
  }
  if (typeof product.department_name === 'undefined') {
    return getDepartmentName(departments).then(handleResponse);
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

function mainMenu(choices) {
  return inquirer.prompt(mainMenuQuestion(choices));
}

module.exports = {
  addInventory,
  addProduct,
  deptToString,
  getProductList,
  mainMenu,
  renderInventoryUpdate,
  validateQuantity,
};
