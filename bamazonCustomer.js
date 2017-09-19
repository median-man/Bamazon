// The app should then prompt users with two messages.
// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.
// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
// However, if your store does have enough of the product, you should fulfill the customer's order.
// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.
// If this activity took you between 8-10 hours, then you've put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.

/* 
*   Import Modules
 */
const inquirer = require("inquirer");
const bamazonDb = require("./BamazonDB");
const ui = require("./Cli"); // implement cmd line ui

(function run() {
// ask user to enter the id of the product they would like to buy
    var id = 5; // hard code id of 5 for testing (bacon bandaids)

    // ask the user how many of the item to buy
    var qtyDesired = 2;

    // scope the product data
    var product;

    // get the quantity of the product available
    bamazonDb.queryProducts(id)
        .then(function(data) {
            product = data[0];
            var qtyAvailable = product.stock_quantity;
            // if desired amount > quantity available ...
            if ( qtyDesired > qtyAvailable ) {
                // ... notify user of insufficient quantity                
                console.log("insufficient quantity");
            
            // if there is enough available...
            } else {
                // update quantity available
                bamazonDb.updateQuantity(id, qtyAvailable - qtyDesired)
                    .then(function() {
                        // display total to user
                        console.log("total:", qtyDesired * product.price);
                    }
                ).catch();
            }
        })
        .then(function() {
            bamazonDb.close(); // close db connection
            
            // ask user to purchase another item or exit
            var continueShopping = false;
            if (continueShopping) run();
        })
        .catch(console.log);
})();


