const managerView = require('./managerView.js');
const customerView = require('./customerView.js');
const BamazonDB = require('./BamazonDB.js');

const db = new BamazonDB();

function showAllProducts() {
  return db
    .getTable()
    .then(customerView.renderProducts);
}

function showLowInventory() {
  return db
    .getLowInventory()
    .then(customerView.renderProducts);
}

function updateInventory({ id, newQuantity }) {
  return db
    .updateProductQty(id, newQuantity)
    .then(() => db.getProductById(id))
    .then(managerView.renderInventoryUpdate);
}

function addInventory() {
  return db
    .getTable()
    .then(managerView.addInventory)
    .then((input) => {
      if (input) return updateInventory(input);
      return null;
    });
}

function addProduct() {
  // return managerView
}

function quit() {
  db.connection.end();
}
function run() {
  managerView
    .mainMenu()
    .then(({ action }) => {
      if (action === 'all') return showAllProducts().then(run);
      if (action === 'low') return showLowInventory().then(run);
      if (action === 'add') return addInventory().then(run);
      if (action === 'new') return addProduct().then(run);
      if (action === 'quit') return quit();
      return run();
    })
    .catch((err) => { throw err; });
}
module.exports = { run };
