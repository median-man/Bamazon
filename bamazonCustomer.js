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
const mysql = require("mysql");

(function run() {
// ask user to enter the id of the product they would like to buy

// ask the user how many of the item to buy

// get the quantity of the product available

// if desired amount > quantity available ...
// ... notify user of insufficient quantity

// if there is enough available...
// update quantity available
// display cost of the purchase to the user

// ask user to purchase another item or exit


})();


