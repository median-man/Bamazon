const { expect } = require('chai');
const managerView = require('../src/managerView.js');
const productDataFixture = require('./fixtures/productData.json');
const deptDataFixture = require('./fixtures/departmentData.json');

describe('managerView', function () {
  describe('getProductList', function () {
    let productData;
    beforeEach(function () {
      productData = Object.assign([], productDataFixture);
    });
    const { getProductList } = managerView;
    it('returns an array', function () {
      expect(getProductList([])).to.be.an('array');
    });
    it('returns an array equal in length to the products argument', function () {
      function testLength() {
        expect(getProductList(productData)).to.have.a.lengthOf(productData.length);
      }
      testLength();
      productData.push({
        item_id: 24,
        product_name: 'Imperial Walker Bagel Slicer',
        department_name: 'Home',
        price: 13.88,
        stock_quantity: 10,
      });
      testLength();
    });
    it('each element is an object with a value that is a number and a name that is a string', function () {
      const prodList = getProductList(productData);
      prodList.forEach((element) => {
        expect(element).to.have.keys('value', 'name');
        expect(element.value).to.be.a('number');
        expect(element.name).to.be.a('string');
      });
    });
  });

  // deptToString returns an array of strings given an array of department objects
  describe('deptToString', function () {
    const { deptToString } = managerView;
    const testDept = deptDataFixture[0];

    // throws if string does not contain all strings in values array
    function includesAll(string, values) {
      values.forEach(val => expect(string).to.include(val));
    }

    it('is a function', function () {
      expect(deptToString).to.be.a('function');
    });

    // Accepts dept object and returns formatted string containing the values
    it('returns a string which contains the dept id, name, and over head costs when passed a dept object', function () {
      const resultStr = deptToString(testDept);
      expect(resultStr).to.be.a('string');
      includesAll(resultStr, Object.values(testDept));
    });

    // Accepts an id and name parameter and returns a formatted string containing them
    it('returns a string which contains id and name parameter when passed id and name arguments', function () {
      const { department_id: id, name } = testDept;
      const resultStr = deptToString(id, name);
      includesAll(resultStr, [id, name]);
    });
  });

  describe('validateQuantity', function () {
    const { validateQuantity } = managerView;
    function expectWhen(quantity, type) {
      describe(`when quantity argument is ${quantity}`, function () {
        if (type === 'string') {
          it('returns a string', function () {
            expect(validateQuantity(quantity)).to.be.a(type);
          });
        } else {
          it('returns true', function () {
            expect(validateQuantity('cancel')).to.be.true;
          });
        }
      });
    }
    expectWhen('cancel', true);
    expectWhen(1, true);
    expectWhen(NaN, 'string');
    expectWhen(-1, 'string');
  });
  describe('validateName', function () {
    const { validateName } = managerView;
    it('is a function', function () {
      expect(validateName).to.be.a('function');
    });
    function expectString(input, msg) {
      it(`returns a string when ${msg || `input is "${input}"`}`, function () {
        expect(validateName(input, 35)).to.be.a('string');
      });
    }
    describe('valid input must be a a string with a length of at least 2', function () {
      it('returns true when input is "Cherlindrea\'s wand"', function () {
        expect(validateName('Cherlindrea\'s wand 24', 25)).to.be.true;
      });
      expectString('a', 'input is an empty string');
    });
    describe('valid input must conatain at least 1 letter from the alphabet', function () {
      expectString('351', 10);
    });
    describe('valid input must not be longer than length paremter', function () {
      const testString = 'test'.repeat(9);
      expectString(testString, `input string has a length of ${testString.length}`);
    });
    it('return true when input is "C" and ignores case', function () {
      expect(validateName('C')).to.be.true;
      expect(validateName('c')).to.be.true;
    });
  });
});
