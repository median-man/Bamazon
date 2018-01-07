const customer = require('./src/bamazonCustomer.js');
const manager = require('./src/bamazonManager.js');

// if passed manager argument, starts manager app, else starts customer app
if (process.argv[2] && process.argv[2].toLowerCase() === 'manager') {
  manager.run();
} else {
  customer.run();
}
