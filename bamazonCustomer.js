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
const BamazonDB = require("./BamazonDB");
const Inquirer = require("inquirer");

// close database connection and stop execution
function quit() {
    BamazonDB.close();
    console.log("Good bye.");
    process.exit();
}

(function run() {
    // get all products
    var allProducts;
    BamazonDB.queryProducts()
        .then(function(data) {
            allProducts = data;

            // list all products to the user
            // console.log("all products:", allProducts);
            UI.newPurchase(allProducts)
                .then(function(input) {

                    // quit application if id is Q
                    if (input.id === "Q") return quit();

                    // get user input for id and quantity
                    var id = parseInt(input.id);
                    var qtyDesired = parseInt(input.quantity);


                    
                    // get the selected product from the array
                    // of products
                    var product = allProducts.find(function(el) {
                            return el.item_id === id;
                    });
                    if (!product) throw new Error("Invalid product id or id not found.");

                    // notify user if available quantity of the
                    // product is insufficient
                    if ( qtyDesired > product.stock_quantity ) {
                        return console.log("insufficient quantity available");            
                    } else {

                        // update the database for quantity available
                        return BamazonDB.updateQuantity(id, product.stock_quantity - qtyDesired)
                            .then(function(){
                                
                                // display transaction to user
                                console.log("total:", qtyDesired * product.price);
                            })
                            .catch(console.log);
                    }
                })
                .catch(console.log);

            
        })
        .then(function() {            
            // ask user to purchase another item or exit
            var continueShopping = false;
            if (continueShopping) return run();
            return quit();
        })
        .catch(console.log);
})();


