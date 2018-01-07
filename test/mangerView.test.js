const { expect } = require('chai');
const managerView = require('../src/managerView.js');
const productDataFixture = require('./productData.json');

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
});
