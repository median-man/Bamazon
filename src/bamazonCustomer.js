/*
*   Import Modules
 */
const BamazonDB = require('./BamazonDB.js');
const customerView = require('./customerView.js');

const { printToConsole } = customerView;

// create a connection to the Bamazon database
const db = new BamazonDB();
const { connection } = db;

// Records transaction if sufficient quantity of the selected
// item is available
function handlePurchase(input, cb) {
  // get the product
  db
    .getProductById(parseInt(input.id, 10))
    .then((product) => {
      // check availability
      if (input.quantity > product.stock_quantity) {
        // there isn't enough available. notify user and return
        printToConsole('\nInsufficient quantity Choose something else.');
        cb();

      // update database and display transaction summary to the user
      } else {
        // update the quantity of the item in the database
        const newQty = product.stock_quantity - input.quantity;
        db
          .updateProductQty(input.id, newQty)
          .then(() => {
            customerView.renderTransaction(product, input.quantity);
            cb();
          })
          .catch((err) => { throw err; });
      }
    });
}

// Handling for all errors are directed to this function. Displays
// a message to the user and closes the db connection.
function handleError(err) {
  // message to display when an unexpted error code is encountered
  const unhandledError = 'An unexpected error has occurred. Please restart ' +
    'the program. If the problem persists, you may need to re-install the application.';

  let errMessage = '';

  switch (err.code) {
    // handle unable to connect to database
    case 'ECONNREFUSED':
      errMessage = 'Unable to connect to the Bamazon database. The server may be down or ' +
      'the server may have been configured to listen to a different port';
      break;

      // handle access to db denied
    case 'ER_ACCESS_DENIED_ERROR':
      errMessage = 'Ivalid username or password. Please check your user name ' +
      "and password in the 'keys.json' file.";
      break;

      // unhandled errors
    default:
      errMessage = unhandledError;
      console.error(err);
  }

  connection.end();
  printToConsole(`\n${errMessage}`);
  printToConsole('Good bye.');
}

// Runs the customer application
function run() {
  // display a table of all items in products table and
  // instantiate productTable
  return db.getTable()
    .then((data) => {
      customerView.renderProducts(data);

      // get user input
      return customerView.getPurchaseInput(data);
    })
    .then((answers) => {
      // if user wants to quit, close db connection
      if (answers.choice === 'Q') {
        return db.connection.end((err) => {
          if (err) return handleError(err);
          return printToConsole('Good bye.');
        });
      }

      // do nothing if quantity is 0
      if (!answers.quantity) return run();

      // return user input
      return handlePurchase({
        id: answers.choice,
        quantity: answers.quantity,
      }, run);
    }).catch(handleError);
}
exports.run = run;
