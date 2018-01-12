const mysql = require('mysql');
const devConfig = require('../db/config.json').dev;

// wraps a mysql query in a promise and returns it
function queryPromise(connection, sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

function BamazonDB(config = devConfig) {
  // create a connection to the Bamazon database
  this.connection = mysql.createConnection(config);
}

BamazonDB.prototype.getTable = function getTable() {
  return queryPromise(this.connection, 'SELECT * FROM products');
};

BamazonDB.prototype.getProductById = function getProductById(id) {
  const sql = 'SELECT * FROM products WHERE item_id=?';
  return queryPromise(this.connection, sql, [id])
    .then(([product]) => product);
};

BamazonDB.prototype.updateProductQty = function updateProductQtyById(id, newQty) {
  const sql = 'UPDATE products SET stock_quantity=? WHERE item_id=?';
  return queryPromise(this.connection, sql, [newQty, id]);
};

BamazonDB.prototype.getLowInventory = function getProductsWithLowInventory() {
  const sql = 'SELECT * FROM products WHERE stock_quantity<=5';
  return queryPromise(this.connection, sql);
};

BamazonDB.prototype.addProduct = function addProductToProductsTable(product) {
  const sql = 'INSERT INTO products SET ?';
  return queryPromise(this.connection, sql, product)
    .then(result => result.insertId)
    .catch((err) => {
      if (err.sqlMessage && err.sqlMessage.includes('foreign key constraint fails')) {
        throw new Error(`invalid department name: ${product.department_name}`);
      }
      throw err;
    });
};

module.exports = BamazonDB;
