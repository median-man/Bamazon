const { expect } = require('chai');
// const { format } = require('mysql');
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

  // products that are added by fixtures/seedTestDB.sql
  const testProducts = [
    {
      product_name: 'The Bobcat Mullet',
      department_name: 'Accessories',
      price: 9.99,
      stock_quantity: 6,
      sales: 0,
    },
    {
      product_name: 'The AB Hancer',
      department_name: 'Sports',
      price: 30.00,
      stock_quantity: 5,
      sales: 300.00,
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
  it('responds responds to getTable, getProductById, and updateProduct', function () {
    expect(testDb).to.respondTo('getTable');
    expect(testDb).to.respondTo('getProductById');
    expect(testDb).to.respondTo('updateProduct');
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

  describe('updateProduct(product)', function () {
    itReturnsPromise(() => testDb.updateProduct(testProducts[0]));

    // query db to verify expected values are present for product where
    // item_id = expectedValues.item_id
    function testUpdate(expectedValues, done) {
      return testDb
        .updateProduct(expectedValues)
        .then(() => testDbFixture
          .query(`SELECT * FROM products WHERE item_id = ${expectedValues.item_id}`))
        .then(data => expect(data[0]).to.include(expectedValues))
        .then(() => done())
        .catch(done);
    }
    const testParam = { item_id: 1, stock_quantity: 5 };
    it(
      `updates stock quantity for item 1 to 5 when the product param is ${JSON.stringify(testParam)}`,
      function (done) {
        testUpdate(testParam, done);
      },
    );
    it('updates all fields with values of product parameter', function (done) {
      testUpdate({
        item_id: 1,
        stock_quantity: 8,
        product_name: 'Magic Acorns',
        price: 0.99,
        sales: 2.97,
      }, done);
    });
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

  describe('addProduct', function () {
    let validTestProduct;
    before(function () {
      validTestProduct = Object.assign({}, {
        product_name: 'Magic Acorns',
        department_name: 'Accessories',
        price: 23.99,
        stock_quantity: 2,
      });
    });
    it('is a function', function () {
      expect(testDb.addProduct).to.be.a('function');
    });
    itReturnsPromise(() => testDb.addProduct(validTestProduct));
    describe('when the product parameter is valid', function () {
      // data returned from running query
      let data;
      // result of calling addProduct
      let result;

      // Get the result of calling addProduct and query the database for
      // the added product.
      beforeEach(function (done) {
        let sql = 'SELECT * FROM products WHERE product_name = ';
        sql += `'${validTestProduct.product_name}'`;
        testDb
          .addProduct(validTestProduct)
          .then((res) => {
            result = res;
            return res;
          })
          .then(() => testDbFixture.query(sql))
          .then(([qryRes]) => {
            data = qryRes;
            done();
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

    describe('when the department name is not in the departments table', () => {
      it('eventually rejects the promise with an error message which includes "invalid department name"', (done) => {
        const badDept = Object.assign({}, validTestProduct);
        badDept.department_name = 'Magic';
        testDb
          .addProduct(badDept)
          .then(() => done('Expected addProduct to reject promise'))
          .catch((err) => {
            expect(err.message).to.include('invalid department name');
            done();
          })
          .catch(done);
      });
    });
  });

  describe('getDepartments', function () {
    it('is a function', function () {
      expect(testDb.getDepartments).to.be.a('function');
    });
    itReturnsPromise(() => testDb.getDepartments());
    describe('when there are two rows in the departments table', function () {
      let result;
      beforeEach(function (done) {
        testDb
          .getDepartments()
          .then((departments) => {
            result = departments;
            done();
          })
          .catch(done);
      });
      it('returns an array with two department objects', function () {
        expect(result).to.be.an('array').with.a.lengthOf(2);
        result.forEach(element => expect(element).to.be.an('object'));
      });
    });
  });

  it('responds to departmentSales', function () {
    expect(testDb).to.respondTo('departmentSales');
  });

  describe('departmentSales', function () {
    itReturnsPromise(() => testDb.departmentSales());
    it('resolves to an array', function (done) {
      testDb
        .departmentSales()
        .then(data => expect(data).to.be.an('array'))
        .then(() => done())
        .catch(done);
    });
    describe('resolved array', function () {
      let result;

      beforeEach(function (done) {
        testDb
          .departmentSales()
          .then(function (data) {
            result = data;
            done();
          })
          .catch(done);
      });

      it('has two elements when there are two departments', function () {
        const deptCount = 2;
        expect(result).to.have.lengthOf(deptCount);
      });

      it('is in descending order by product_sales', function () {
        expect(result.map(row => row.product_sales)).to.satisfy((sales) => {
          for (let i = 1; i < sales.length; i += 1) {
            expect(sales[i - 1]).to.be.greaterThan(sales[i]);
          }
          return true;
        });
      });

      describe('each element', function () {
        it('is an object', function () {
          result.forEach(element => expect(element).to.be.an('object'));
        });
        it('has department_id, department_name, over_head_costs, and product_sales keys', function () {
          result.forEach(element => expect(element).to.have.all.keys([
            'department_id',
            'department_name',
            'over_head_costs',
            'product_sales',
          ]));
        });
      });

      describe('when the sum of all products in the sports department is 300', function () {
        const seededSportsSales = 300;
        it('product_sales = 300 for the object where department_name = "Sports"', function () {
          const sportsDept = result.find(el => el.department_name === 'Sports');
          expect(sportsDept.product_sales).to.equal(seededSportsSales);
        });
      });
    });
  });
});
