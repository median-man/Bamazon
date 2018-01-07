const { expect } = require('chai');
const customerView = require('../src/customerView.js');

describe('customerView', function () {
  const productData = [
    {
      item_id: 11,
      product_name: 'Cupcake',
      department_name: 'Health',
      price: 3.99,
      stock_quantity: 628,
    },
    {
      item_id: 2,
      product_name: 'Brownie',
      department_name: 'Sweets',
      price: 2.27,
      stock_quantity: 452,
    },
  ];
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

});
