const { expect } = require('chai');
const mysql = require('mysql');
const configs = require('../db/config.json');
const BamazonDB = require('../src/BamazonDB.js');

// executes a query on a connection for each query in an array. throws if an
// err is passed to the callback for the query. Once all queries are complete
// executes optional callback function
function runQueries(connection, queries, cb) {
  let completedQueries = 0;
  queries.forEach((query) => {
    connection.query(query, (err) => {
      if (err) throw err;
      completedQueries += 1;
      if (cb && completedQueries === queries.length) cb();
    });
  });
}

describe('BamazonDB', function () {
  let testDb;
  const testProducts = [
    {
      product_name: 'Nostalgia Electrics BSET100CR 3 in 1 Breakfast Station',
      department_name: 'Home',
      price: 69.99,
      stock_quantity: 3,
    },
    {
      product_name: 'The AB Hancer',
      department_name: 'Sports',
      price: 30.00,
      stock_quantity: 300,
    },
  ];
  beforeEach(function initializeDB(done) {
    testDb = new BamazonDB(configs.test);

    const productToSql = product => `("${product.product_name}", "${product.department_name}", ${product.price}, ` +
      `${product.stock_quantity})`;

    const productsTableName = 'products';
    const createProductTblSql =
      'CREATE TABLE products(' +
        'item_id INT NOT NULL AUTO_INCREMENT,' +
        'product_name VARCHAR(100) NOT NULL,' +
        'department_name VARCHAR(45) NOT NULL,' +
        'price DECIMAL(7,2) default 0,' +
        'stock_quantity INT default 0,' +
        'PRIMARY KEY (item_id)' +
      ');';
    const seedProductTblSql =
      'INSERT INTO ' +
        'products(product_name, department_name, price, stock_quantity) ' +
      `VALUES ${productToSql(testProducts[0])}, ${productToSql(testProducts[1])}`;

    // reset the products table and seed it
    runQueries(testDb.connection, [`DROP TABLE IF EXISTS ${productsTableName}`]);
    runQueries(testDb.connection, [createProductTblSql, seedProductTblSql], done);
    // initTestDb(testDb.connection, () => done());
  });
  afterEach(function closeDbConnection(done) {
    if (testDb.connection.state !== 'disconnected') testDb.connection.end();
    done();
  });
  after(function destroyDbConnection() {
  });
  it('has a connection', function () {
    expect(testDb.connection).to.be.an('object');
  });
  it('responds responds to getTable, getProductById, and updateProductQty', function () {
    expect(testDb).to.respondTo('getTable');
    expect(testDb).to.respondTo('getProductById');
    expect(testDb).to.respondTo('updateProductQty');
  });

  describe('#constructor', function () {
    it('defaults to the dev database config if no config argument is passed', function () {
      const db = new BamazonDB();
      expect(db.connection.config.database).to.equal(configs.dev.database);
      db.connection.end();
    });
    it('sets the connection database from the config parameter', function () {
      expect(testDb.connection.config.database, 'connection.config.database')
        .to.equal(configs.test.database);
    });
  });

  describe('getTable', function () {
    it('returns a promise', function () {
      expect(testDb.getTable()).to.be.a('promise');
    });
    it('eventually returns an array for all the rows of the products table', function (done) {
      testDb
        .getTable()
        .then((data) => {
          expect(data.length).to.equal(testProducts.length);
          done();
        })
        .catch(done);
    });
  });

  describe('getProductById', function () {
    it('returns a promise', function () {
      expect(testDb.getProductById(1)).to.be.a('promise');
    });
    it('eventually returns a product object', function (done) {
      testDb
        .getProductById(1)
        .then((data) => {
          expect(data).to.be.an('object')
            .that.includes.all.keys(
              'item_id',
              'product_name',
              'department_name',
              'price',
              'stock_quantity',
            );
          done();
        })
        .catch(done);
    });
    function testGetProductById(id, expectedProduct) {
      const product = expectedProduct;
      product.item_id = id;
      it(`eventually returns the requested data where item_id = ${id}`, function (done) {
        testDb
          .getProductById(id)
          .then((data) => {
            expect(data).to.be.deep.equal(product);
            done();
          })
          .catch(done);
      });
    }
    testGetProductById(1, testProducts[0]);
    testGetProductById(2, testProducts[1]);
  });

  describe('updateProductQty', function () {
    it('returns a promise', function () {
      expect(testDb.updateProductQty(1, 1)).to.be.a('promise');
    });
    function describeResult(id, newQty) {
      describe(`when the id is ${id} and the newQty is ${newQty}`, function () {
        it(`eventually updates the stock_quantity to ${newQty}`, function (done) {
          testDb
            .updateProductQty(id, newQty)
            .then(() => {
              testDb.connection.end();
              const testConnection = mysql.createConnection(configs.test);
              testConnection.query(`SELECT stock_quantity FROM products WHERE item_id = ${id}`, (err, res) => {
                if (err) throw err;
                expect(res[0].stock_quantity).to.equal(newQty);
                done();
                testConnection.end();
              });
            })
            .catch(done);
        });
      });
    }
    describeResult(1, 1);
    describeResult(1, 20);
  });
});
