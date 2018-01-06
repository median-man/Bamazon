const mysql = require('mysql');
const devConfig = require('../db/config.json').dev;

// wraps a mysql query in a promise and returns it
function queryPromise(connection, sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

function BamazonDB(config = devConfig) {
  // create a connection to the Bamazon database
  this.connection = mysql.createConnection(config);
}

BamazonDB.prototype.getTable = function getTable() {
  return new Promise(((resolve, reject) => {
    // get all product data from db
    const sql = 'SELECT * FROM products';
    this.connection.query(sql, (err, res) => {
      if (err) return reject(err);

      // run callback
      return resolve(res);
    });
  }));
};

BamazonDB.prototype.getProductById = function getProductById(id) {
  const sql = 'SELECT * FROM products WHERE item_id = ?';
  return queryPromise(this.connection, sql, [id])
    .then(([product]) => ({
      id: product.item_id,
      name: product.product_name,
      dept: product.department_name,
      price: product.price,
      quantity: product.stock_quantity,
    }));
};

BamazonDB.prototype.updateProductQty = function updateProductQtyById(id, newQty) {
  const sql = 'UPDATE products SET stock_quantity=? WHERE item_id=?';
  return queryPromise(this.connection, sql, [newQty, id]);
};

module.exports = BamazonDB;
