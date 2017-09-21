/* 
*   Import Modules
 */
const Mysql = require("mysql");
const Inquirer = require("inquirer");
const Keys = require("./keys.json");
const Table = require('cli-table');

// product table instance
var productTable;

// create a connection to the Bamazon database
var connection = Mysql.createConnection(
    {
        user: Keys.bamazon_db.username,
        password: Keys.bamazon_db.password,
        host: "localhost",
        port: 3306,
        database: "bamazon_DB",
    }
);

// Class with properties and methods for interacting with and rendering 
// product data
function ProductTable(products) {

    // configure table headers and styling
    var table = new Table({
        head        : ["Id", "Item", "Dept", "Price", "Qty"],
        colWidths   : [4,50,10,7,5]
    });

    // array of products
    this.products = products;

    // Returns a product object from products array with matching id
    this.getProductById = function(id) {
        id = parseInt(id);

        // return the matching product or undefined
        return this.products.find(function(element) {
            return element.item_id === id;
        });
    }

    // Returns a string representation of the table including
    // borders and other formatting properties
    this.toString = function() {
        this.products.forEach(function(element) {
            table.push(
                [
                    element.item_id.toString(),
                    element.product_name,
                    element.department_name,
                    element.price.toFixed(2),
                    element.stock_quantity.toString()
                ]
            );
        });
        return table.toString();
    }
}

// Get data from bamazon db and pass data to callback
function getTable(productTable) {
    return new Promise(function(resolve, reject) {

        // get all product data from db
        var query = "SELECT * FROM products";
        connection.query(query, function(err, res) {
            if (err) return reject(err);

            // run callback
            resolve(res);
        });
    });
}

// Prompt user for item to purchase and quantity or to
// quit application
function getPurchaseInput() {
    // return prompt
    return Inquirer.prompt([
        {
            name    : "choice",
            type    : "input",
            message : "Enter the ID for the item you would like to " +
                      "purchase or 'Q' to quit:",

            // ensure there is a product with entered id
            validate: function(input) {
                if ( typeof productTable.getProductById(input) !== 'undefined' ) return true;
                if (input === "Q" ) return true;
                return input + " is not a valid choice.";
            }
        },
        {
            name    : "quantity",
            type    : "input",
            message : "How many?",
            
            // display question if user did not select quit
            when    : function(answers) { return answers.choice !== 'Q'},

            // quantity must be a number greater than or = 0
            validate: function(input) {
                return parseFloat(input) >= 0 || "Amount must be a number greater than 0.";
            }
        }        
    ]);
}

// displays transaction info
function showTransaction(product, quantity) {
    console.log(
        "\nSuccessfully purchased " + quantity + " of " + product.product_name +
        " for $" + (product.price * quantity).toFixed(2) + "."
    );
    run();
}

// Records transaction if sufficient quantity of the selected
// item is available
function handlePurchase(input) {
    
    // get the product
    var product = productTable.getProductById(input.id);

    // check availability
    if ( input.quantity > product.stock_quantity ) {

        // there isn't enough available. notify user and return
        console.log("\nInsufficient quantity Choose something else.");
        run();
    }

    // update database and display transaction summary to the user
    else {

        // update the quantity of the item in the database
        var newQty = product.stock_quantity - input.quantity;
        var query = "UPDATE products SET ? WHERE ?";
        connection.query(
            query, 
            [
                { stock_quantity : newQty },
                { item_id : input.id }
            ],
            function(err, res) {
                if (err) throw err;

                // display transaction
                showTransaction(product, input.quantity);
            }
        );
    }
}

// Runs the customer application
function run() {
    
    // display a table of all items in products table and
    // instantiate productTable
    getTable()
        .then(function(data) {

            // create a new instance of ProductTable and display it
            productTable = new ProductTable(data);
            console.log("\n\n" + productTable.toString());

            // get user input
            return getPurchaseInput();
        })
        .then(function(answers) {

            // if user wants to quit, close db connection
            if ( answers.choice === "Q" ) {
                return connection.end(function(err) { 
                    if (err) return handleError(err); 
                    return console.log("Good bye.");
                });
            }
            
            // do nothing if quantity is 0
            if ( !answers.quantity ) return run();
            
            // return user input
            handlePurchase({
                id: answers.choice,
                quantity: answers.quantity
            });
        }).catch(handleError);
}

// Connect to the database and run the app
connection.connect(function(err) {
    if (err) return handleError(err);
    run();
});

// Handling for all errors are directed to this function. Displays
// a message to the user and closes the db connection.
function handleError(err) {

    // message to display when an unexpted error code is encountered
    const unhandledError = "An unexpected error has occurred. Please restart " +
        "the program. If the problem persists, you may need to re-install the application.";
    
    var errMessage = "";

    switch ( err.code ) {

        // handle unable to connect to database
        case "ECONNREFUSED":
            errMessage = "Unable to connect to the Bamazon database. The server may be down or " +
                "the server may have been configured to listen to a different port";
            break;

        // handle access to db denied
        case "ER_ACCESS_DENIED_ERROR":
            errMessage = "Ivalid username or password. Please check your user name " +
                "and password in the 'keys.json' file.";
            break;
        
        // unhandled errors
        default:
            errMessage = unhandledError;
            console.log(err);
    }

    connection.end();
    console.log("\n" + errMessage);
    console.log("Good bye.");
}