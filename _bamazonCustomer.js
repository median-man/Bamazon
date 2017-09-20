/* 
*   Import Modules
 */
const Mysql = require("mysql");
const Inquirer = require("inquirer");
const Keys = require("./keys.json");

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

// Class with properties and methods for interacting with and rendering product data
function ProductTable(products) {
    // column widths for listing products table data
    const columnWidths = {
        id      : 4,
        item    : 50,
        dept    : 10,
        price   : 7,
        qty     : 5
    };

    // headings for each column
    const columnHeadings = {
        id      : "Id",
        item    : "Item",
        dept    : "Dept",
        price   : "Price",
        qty     : "Qty"
    };

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

    // Returns a string representation of the table
    this.toString = function() {

        // build an array of strings. one element for each row of data
        var rows = [];
        this.products.forEach(function(element) {
            rows.push(getRow(element));
        });
        return rows.join("\n");
    }

    // Returns a string for a row of product data.
    function getRow(product) {

        // get formatted strings for product values
        var prodStr = {
            id      : product.item_id.toString(),
            item    : product.product_name,
            dept    : product.department_name,
            price   : product.price.toFixed(2),
            qty     : product.stock_quantity.toString()
        }

        // concatenate a string for each value as a cell
        return getCell(prodStr.id, columnWidths.id) +
            getCell(prodStr.item, columnWidths.item) +
            getCell(prodStr.dept, columnWidths.dept) +
            getCell(prodStr.price, columnWidths.price) +
            getCell(prodStr.qty, columnWidths.qty);
    }

    // Truncates or adds padding to the right to
    // return a string wher length is equal to the
    // width parameter. Optional pad value changes
    // the sing character used for padding.
    function getCell(val, width, pad = " ") {
        val = val.toString();
        if ( val.length < width ) {

            // add padding and a single space 'border' to the right
            return val + pad.repeat(width - val.length) + " ";
        }

        // truncate when length of val exceeds the column width and
        // add a single space for a 'border'
        else {
            return val.substr(0, width) + " ";
        }
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
            when    : function(answers) { return answers.choice !== 'Q'}
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
            // user wants to quit
            if ( answers.choice === "Q" ) {
                connection.end();
                return console.log("Good bye.");
            } 
            
            // return user input
            handlePurchase({
                id: answers.choice,
                quantity: answers.quantity
            });
        }).catch(console.log);
}

connection.connect(function(err) {
    if (err) throw err;
    run();
});