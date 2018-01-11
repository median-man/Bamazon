const { expect } = require('chai');
const configs = require('../db/config.json');
const BamazonDB = require('../src/BamazonDB.js');
const testDbFixture = require('./fixtures/testDB.js');

// Test if function returns a promise and then resolves the promise to allow
// the mocha process to exit.
function itReturnsPromise(func) {
  it('returns a promise', function (done) {
    const res = func();
    expect(res).to.be.a('promise');
    res.then(() => done()).catch(done);
  });
}

describe('BamazonDB', function () {
  let testDb;
  const testProducts = [
    {
      product_name: 'The Bobcat Mullet',
      department_name: 'Accessories',
      price: 9.99,
      stock_quantity: 6,
    },
    {
      product_name: 'The AB Hancer',
      department_name: 'Sports',
      price: 30.00,
      stock_quantity: 5,
    },
  ];
  function initializeDB(done) {
    // initialize the test db and seed it
    testDbFixture
      .init()
      .then(testDbFixture.seed)
      .then((con) => {
        con.end((err) => {
          if (err) throw err;
          // create new instance of BamazonDB
          testDb = new BamazonDB(configs.test);
          done();
        });
      })
      .catch(done);
  }
  beforeEach(initializeDB);
  afterEach(function closeDbConnection(done) {
    if (testDb.connection.state !== 'disconnected') {
      testDb.connection.end((err) => {
        if (err) return done(err);
        return done();
      });
    } else {
      done();
    }
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
    itReturnsPromise(() => testDb.getTable());
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
    itReturnsPromise(() => testDb.getProductById(1));
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
    itReturnsPromise(() => testDb.updateProductQty(1, 1));
    function describeResult(id, newQty) {
      describe(`when the id is ${id} and the newQty is ${newQty}`, function () {
        it(`eventually updates the stock_quantity to ${newQty}`, function (done) {
          testDb
            .updateProductQty(id, newQty)
            .then(() => {
              // testDb.connection.end();
              testDbFixture
                .query(`SELECT stock_quantity FROM products WHERE item_id = ${id}`)
                .then((data) => {
                  expect(data[0].stock_quantity).to.equal(newQty);
                  done();
                });
            })
            .catch(done);
        });
      });
    }
    describeResult(1, 1);
    describeResult(1, 20);
  });

  describe('getLowInventory', function () {
    function testGetLowInventory(quantity, isEmpty, done) {
      testDbFixture
        .init()
        .then(testDbFixture.seed)
        .then(con => con.end())
        .then(() => testDbFixture
          .query(`UPDATE products SET stock_quantity = ${quantity}`))
        .then(() => {
          // testDbFixture.seed inserts 2 rows
          const expectedLength = isEmpty ? 0 : 2;
          return testDb
            .getLowInventory()
            .then((data) => {
              expect(data).to.be.an('array').with.lengthOf(expectedLength);
              done();
            });
        })
        .catch(done);
    }
    it('returns an empty array when all products have an inventory greater than 5', function (done) {
      testGetLowInventory(6, true, done);
    });
    it('returns an array of two products there are two products with an inventory of 5 or less', function (done) {
      testGetLowInventory(5, false, done);
    });
  });

  describe.skip('addProduct', function () {
    let validTestProduct;
    before(function () {
      validTestProduct = Object.assign({}, {
        product_name: 'Magic Acorns',
        department_name: 'Magic',
        price: 23.99,
        stock_quantity: 2,
      });
    });
    it('is a function', function () {
      expect(testDb.addProduct).to.be.a('function');
    });
    it('returns a promise', function () {
      expect(testDb.addProduct(validTestProduct)).to.be.a('promise');
    });
    describe('when the product parameter is valid', function () {
      let data;
      let result;
      beforeEach(function (done) {
        function handleQueryResponse(err, response) {
          if (err) done(err);
          [data] = response;
          done();
        }
        testDb
          .addProduct(validTestProduct)
          .then((res) => {
            result = res;
            testDb
              .connection
              .query(
                'SELECT * FROM products WHERE product_name = ?',
                [validTestProduct.product_name],
                handleQueryResponse,
              );
          })
          .catch(done);
      });
      it('adds the product to the products table', function () {
        expect(data).to.be.an('object');
        expect(data).to.include(validTestProduct);
      });
      it('returns the id of the added product', function () {
        expect(result).to.be.a('number');
        expect(result).to.equal(data.item_id);
      });
    });
    describe('when the product parameter is not valid', function () {
      it('eventually rejects with an error', function (done) {
        const invalidTest = {
          product_name: 'Bad',
        };
        // const name = invalidTest.product_name;
        testDb
          .addProduct(invalidTest)
          .then(done)
          .catch(() => done());
      });
    });
  });

  describe('getDepartments', function () {

  });
});
