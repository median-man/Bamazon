const customer = require('./src/bamazonCustomer.js');
const manager = require('./src/bamazonManager.js');
const supervisor = require('./src/bamazonSupervisor.js');

// launch selected app. defaults to customer
switch (process.argv[2]) {
  case 'manager':
    manager.run();
    break;

  case 'supervisor':
    supervisor();
    break;

  default:
    customer.run();
}
