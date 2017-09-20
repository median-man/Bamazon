/* 
 *  Module provides a command line user interface for bamazon app.
 *  */

/* 
 *  Module Imports
 *  */
const inquirer = require("inquirer");

var Cli = function() {

    // column widths for listing products table data
    const colId     = 4,
        colItem     = 50,
        colDept     = 10,
        colPrice    = 7,
        colQty      = 5;

    // renders a list of products with information
    // on the command line
    function listProducts(products) {

        // column headings formatted
        var header = [
            getRow({
                item_id         : "Id",
                product_name    : "Product",
                department_name : "Dept.",
                price           : "Price",
                stock_quantity  : "Quantity"
            }),
            getRow({
                item_id         : "-".repeat(colId),
                product_name    : "-".repeat(colItem),
                department_name : "-".repeat(colDept),
                price           : "-".repeat(colPrice),
                stock_quantity  : "-".repeat(colQty)
            })
        ];

        // get strings for each row from items
        var rows = products.map(function(product) {
            return getRow(product);
        });

        // display the table
        rows = header.concat(rows);
        console.log(rows.join("\n"));
    }

    // returns a string for a row in the products list
    // spaced to display data in tabular form
    function getRow(values) {
        // column widths (+1 for padding between columns)
        var row =  fixedWidth(values.item_id.toString(), colId) + " " +
            fixedWidth(values.product_name, colItem) + " " +
            fixedWidth(values.department_name, colDept) + " " +
            fixedWidth(values.price.toString(), colPrice) + " " +
            fixedWidth(values.stock_quantity.toString(), colQty);
        return row;
    }

    // returns string truncated or with padding added to fix
    // the width of the string. pad_char must be a single character.
    function fixedWidth(s, length, pad_char = " ") {
        if ( s.length < length ) {
            return s + pad_char.repeat(length - s.length);
        } else {
            return s.substr(0,length);
        }
    }

    // Prompts user to continue shopping
    this.continueShopping = function() {
        console.log("continue shopping?");
        return false;
    };

    // displays total and transaction summary information
    // to the user
    this.displayTotal = function(item, qty, total) {
        console.log("Transaction:",item, qty, total);
    };

    // Display insufficient quantity message to the user
    this.insufficientQuantity = function(available) {
        console.log("Insufficient quantity!");
        console.log("Amount available:", available);
    };

    // Returns item id and quantity desired from
    // user input
    this.newPurchase = function(products) {
        var message = "Enter the ID for the item you would like to " +
            "purchase or 'Q' to quit:";
        var result = {id:"", quantity:0};

        // display a table of products
        listProducts(products);

        // prompt user and return promise passing
        // user input to callback
        return inquirer.prompt([
            {
                message: message,
                type: "input",
                name: "id"
            },
            {
                message: "How many?",
                type: "input",
                name: "quantity",
                when: function(answers) {
                    return answers !== "Q";
                }
            }
            
        // return the user input
        ]).then(function(answers) {
            result.id = answers.id;
            if ( answers.quantity ) result.quantity = answers.quantity;
            return result;
        });
    };
};

// export instance of Cli
module.exports = new Cli();