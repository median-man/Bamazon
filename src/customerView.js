const Table = require('cli-table');

function renderProducts() {

}
function createProductTable(data) {
  const table = new Table({
    head: ['Id', 'Item', 'Dept', 'Price', 'Qty'],
    colWidths: [4, 50, 10, 7, 5],
  });
  data.forEach((product) => {
    table.push([
      product.item_id,
      product.product_name,
      product.department_name,
      product.price,
      product.stock_quantity,
    ]);
  });
  return table.toString();
}
module.exports = { createProductTable, renderProducts };
