const mysql = require('mysql');
const devConfig = require('../db/config.json').dev;

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
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM products WHERE item_id = ?';
    this.connection.query(sql, id, (err, [product]) => {
      if (err) throw err;
      resolve({
        id: product.item_id,
        name: product.product_name,
        dept: product.department_name,
        price: product.price,
        quantity: product.stock_quantity,
      });
    });
  });
};

module.exports = BamazonDB;
