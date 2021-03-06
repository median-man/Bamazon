const superView = require('./supervisorView.js');
const BamazonDB = require('./BamazonDB.js');

const db = new BamazonDB();

function addDepartment() {
  // get department name from user
  return superView
    .getNewDept()
    .then((input) => {
      if (!input) return false;
      return db
        .addDepartment(input)
        .then((newDept) => {
          if (newDept) {
            return `Succesfully added ${newDept.name} to departments`;
          }
          return 'Department already exists.';
        })
        .then(superView.printToConsole);
    })

    // do nothing if an error occurs
    .catch(() => null);
}

// Display sales and profits grouped by department
function deptSales() {
  return db
    // get department sales from the database
    .departmentSales()
    .then(data => data.map(row => Object.assign(
      {},
      row,
      { total_profit: row.product_sales - row.over_head_costs },
    )))

    // display table
    .then(data => superView.renderDeptSales(data)).catch(console.error);
}

function run() {
  superView
    .mainMenu([
      { value: 'dept-sales', name: 'View department sales' },
      { value: 'add-dept', name: 'Add new department' },
      { value: 'quit', name: 'Quit' },
    ])
    .then(({ action }) => {
      if (action === 'dept-sales') return deptSales().then(run);
      if (action === 'add-dept') return addDepartment().then(run);
      if (action === 'quit') return db.connection.end();
      console.log(action);
      return run();
    })
    .catch((err) => { throw err; });
}

module.exports = run;
