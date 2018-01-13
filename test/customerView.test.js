const { expect } = require('chai');
const customerView = require('../src/customerView.js');
const productData = require('./fixtures/productData.json');

describe('customerView', function () {
  function itHasMethod(method) {
    it(`has a ${method} method`, function () {
      expect(customerView, 'customerView').to.respondTo(method);
    });
  }
  [
    'createProductTable',
    'getPurchaseInput',
    'printToConsole',
    'renderProducts',
    'renderTransaction',
    'validateChoice',
    'validateQuantity',
  ].forEach(itHasMethod);

  describe('createProductTable', function () {
    const { createProductTable } = customerView;
    let result;
    before(function () {
      result = createProductTable(productData);
    });
    it('returns a string', function () {
      expect(result).to.be.a('string');
    });
    function testResult(product) {
      it('returns a string containing each value in the product table passed to it', function () {
        Object
          .keys(product)
          .forEach(key => expect(result).to.include(product[key], `${key} missing`));
      });
    }
    productData.forEach(testResult);
  });
  describe('validateChoice', function () {
    const { validateChoice } = customerView;
    describe('when the products parameter has items with id\'s including 2 and 11', function () {
      it('returns true when choice is Q ignoring the case', function () {
        expect(validateChoice('Q')).to.be.true; // eslint-disable-line
        expect(validateChoice('q')).to.be.true; // eslint-disable-line
      });

      function itReturnsTrue(choice) {
        it(`returns true when choice is ${choice} and item ${choice} has quantity > 0`, function () {
          expect(validateChoice(choice, productData)).to.be.true; // eslint-disable-line
        });
      }
      itReturnsTrue(2);
      itReturnsTrue(11);

      it('returns a message when choice is 2 and item 2 has quantity = 0', function () {
        const item2 = productData.find(product => product.item_id === 2);
        const quantity = item2.stock_quantity;
        item2.stock_quantity = 0;
        expect(validateChoice(2, productData)).to.be.a('string');
        item2.stock_quantity = quantity;
      });
      it('returns a message when choice is 1', function () {
        expect(validateChoice(1, productData)).to.be.a('string');
      });
      it('returns false when choice is a string other than q or Q', function () {
        expect(validateChoice('foo')).to.be.false; // eslint-disable-line
      });
    });
  });
  describe('validateQuantity', function () {
    const { validateQuantity } = customerView;
    beforeEach(function () {
      productData.find(product => product.item_id === 2).stock_quantity = 10;
    });
    it('accepts a quantity, id, and products arguments', function () {
      validateQuantity(1, 2, productData);
    });
    it('returns true when amount is less than the stock quantity for the item', function () {
      expect(validateQuantity(1, 2, productData)).to.be.true;
    });
    it('returns a string when amount is greater than the stock quantity for the item', function () {
      expect(validateQuantity(11, 2, productData)).to.be.a('string');
    });
    it('returns true when amount is equal to the stock quantity for the item', function () {
      expect(validateQuantity(10, 2, productData)).to.be.true;
    });
    it('returns false when amount is less than 0', function () {
      expect(validateQuantity(-1, 2, productData)).to.be.false;
    });
  });
});
