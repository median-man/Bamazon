/*
*   Import Modules
 */
const Inquirer = require('inquirer');
const Table = require('cli-table');
const BamazonDB = require('./BamazonDB.js');
const customerView = require('./customerView.js');

// create a connection to the Bamazon database
const db = new BamazonDB();
const { connection } = db;

// Prompt user for item to purchase and quantity or to
// quit application
function getPurchaseInput(products) {
  // return prompt
  return Inquirer.prompt([
    {
      name: 'choice',
      type: 'input',
      message: 'Enter the ID for the item you would like to ' +
        "purchase or 'Q' to quit:",

      // ensure there is a product with entered id
      validate(input) {
        const inputInt = parseInt(input, 10);
        if (products.find(product => product.item_id === inputInt)) return true;
        if (input === 'Q') return true;
        return `${input} is not a valid choice.`;
      },
    },
    {
      name: 'quantity',
      type: 'input',
      message: 'How many?',

      // display question if user did not select quit
      when(answers) { return answers.choice !== 'Q'; },

      // quantity must be a number greater than or = 0
      validate(input) {
        return parseFloat(input) >= 0 || 'Amount must be a number greater than 0.';
      },
    },
  ]);
}

// displays transaction info
function showTransaction(product, quantity) {
  console.log(`\nSuccessfully purchased ${quantity} of ${product.name} for ` +
    `$${(product.price * quantity).toFixed(2)}.`);
}

// Records transaction if sufficient quantity of the selected
// item is available
function handlePurchase(input) {
  // get the product
  db.getProductById(parseInt(input.id, 10))
    .then((product) => {
      // check availability
      if (input.quantity > product.quantity) {
        // there isn't enough available. notify user and return
        console.log('\nInsufficient quantity Choose something else.');
        run();

      // update database and display transaction summary to the user
      } else {
        // update the quantity of the item in the database
        const newQty = product.quantity - input.quantity;
        db
          .updateProductQty(input.id, newQty)
          .then(() => {
            showTransaction(product, input.quantity);
            run();
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
      console.log(err);
  }

  connection.end();
  console.log(`\n${errMessage}`);
  console.log('Good bye.');
}

// Runs the customer application
function run() {
  // display a table of all items in products table and
  // instantiate productTable
  return db.getTable()
    .then((data) => {
      // create a new instance of ProductTable and display it
      // productTable = new ProductTable(data);
      console.log(`\n\n${customerView.createProductTable(data)}`);

      // get user input
      return getPurchaseInput(data);
    })
    .then((answers) => {
      // if user wants to quit, close db connection
      if (answers.choice === 'Q') {
        return db.connection.end((err) => {
          if (err) return handleError(err);
          return console.log('Good bye.');
        });
      }

      // do nothing if quantity is 0
      if (!answers.quantity) return run();

      // return user input
      return handlePurchase({
        id: answers.choice,
        quantity: answers.quantity,
      });
    }).catch(handleError);
}
exports.run = run;
