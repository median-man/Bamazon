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

BamazonDB.prototype.getTable = function getTable(table) {
  const sql = 'SELECT * FROM ??';
  return queryPromise(this.connection, sql, [table || 'products']);
};

BamazonDB.prototype.getProductById = function getProductById(id) {
  const sql = 'SELECT * FROM products WHERE item_id=?';
  return queryPromise(this.connection, sql, [id])
    .then(([product]) => product);
};

BamazonDB.prototype.updateProduct = function updateProduct(product) {
  const { item_id: id } = product;
  const sql = 'UPDATE products SET ? WHERE item_id=?';
  return queryPromise(this.connection, sql, [product, id]);
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
BamazonDB.prototype.getDepartments = function getAllDepartments() {
  return this.getTable('departments');
};

BamazonDB.prototype.departmentSales = function getDepartmentSalesTotals() {
  let sql = 'SELECT departments.department_id, departments.name AS department_name, ';
  sql += 'departments.over_head_costs, SUM(products.sales) AS product_sales ';
  sql += 'FROM departments ';
  sql += 'LEFT JOIN products ON departments.name = products.department_name ';
  sql += 'GROUP BY departments.name ';
  sql += 'ORDER BY product_sales DESC';

  return queryPromise(this.connection, sql);
};

// Add new department and return the new department object or false if name is duplicate.
BamazonDB.prototype.addDepartment = function addDepartment(department) {
  let sql = 'INSERT INTO departments SET ?';
  return queryPromise(this.connection, sql, department)
    .then(({ insertId }) => {
      sql = `SELECT * FROM departments WHERE department_id = ${insertId}`;
      return queryPromise(this.connection, sql);
    })
    .then(data => data[0])
    .catch((err) => {
      // return false if entry is duplicate
      if (err.code === 'ER_DUP_ENTRY') return false;
      throw err;
    });
};

module.exports = BamazonDB;
