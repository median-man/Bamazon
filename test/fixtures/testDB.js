/* Fixture for initializing the test db and verifying tests */
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
// const execsql = require('execsql');
const testConfig = require('../../db/config.json').test;

// returns string which contains sql statements to delete then
// create the test database
function sqlStatements(sql) {
  const fname = sql === 'seeds' ? './seedTestDB.sql' : './createTestDB.sql';
  // path to sql script to drop, create, and seed the test db
  const sqlPath = path.join(__dirname, fname);
  return new Promise((resolve, reject) => {
    fs.readFile(sqlPath, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

// Creates a connection which accepts multi-statement queries and returns
// a promise for the connection object
function connect(conf, multipleStatements = true) {
  return new Promise((resolve, reject) => {
    const con = mysql.createConnection(Object.assign({}, conf, { multipleStatements }));
    con.connect((err) => {
      if (err) {
        return reject(err);
      }
      return resolve(con);
    });
  });
}

// Runs sql query and returns a promise for the connection object
function query(con, sql) {
  return new Promise((resolve, reject) => {
    con.query(sql, (err) => {
      if (err) return reject(err);
      return resolve(con);
    });
  });
}

module.exports = {
  // drop and create the database with seed data from sql file
  init: function createTestDb() {
    let sql;

    // get sql to create db
    return sqlStatements()
      .then((statements) => {
        sql = statements;
        return testConfig;
      })
      .then(connect)
      .then(con => query(con, sql));
  },

  // Remove all data and seed db. Returns connection. Departments and products
  // must be an array of arrays where the inner array contains the values to seed.
  seed: function seedTestDb(con, departments, products) {
    if (!departments || !products) {
      // seed database from sql file
      return sqlStatements('seeds').then(sql => query(con, sql));
    }
    con.query('INSERT INTO departments (name,over_head_costs) VALUES ?', [departments]);
    con.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?', [products]);
    return con;
  },

  // run query on test db. returns connection
  query: function connectAndQueryTestDb(sql, multi) {
    return connect(testConfig, multi)
      .then(con => new Promise((resolve, reject) => {
        con.query(sql, (err, data) => {
          if (err) return reject(err);
          con.end();
          return resolve(data);
        });
      }));
  },
};
