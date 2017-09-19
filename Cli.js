/* 
 *  Module provides a command line user interface for bamazon app.
 *  */

/* 
 *  Module Imports
 *  */
const inquirer = require("inquirer");

var Cli = function() {

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
    this.newPurchase = function() {
        return {
            id: 5,
            quantity: 1
        };
    };
};

// export instance of Cli
module.exports = new Cli();