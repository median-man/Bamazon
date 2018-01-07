const managerView = require('./managerView.js');
const customerView = require('./customerView.js');
const BamazonDB = require('./BamazonDB.js');

const db = new BamazonDB();
function showAllProducts() {
  return db
    .getTable()
    .then(customerView.renderProducts);
}
function quit() {
  db.connection.end();
}
function run() {
  managerView
    .mainMenu()
    .then(({ action }) => {
      if (action === 'all') {
        return showAllProducts()
          .then(run);
      }
      if (action === 'quit') return quit();
      return run();
    })
    .catch((err) => { throw err; });
}
module.exports = { run };
