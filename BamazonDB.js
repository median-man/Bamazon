/* 
 *  This module provides an interface for the Bamazon database.
 * */

/* 
 * Import modules
 * */
const mysql = require("mysql");
const keys = require("./keys.json").bamazon_db;

// configuration settings for connecting to the database
const dbConfig = {
    user: keys.username,
    password: keys.password,
    host: "localhost",
    port: 3306,
    database: "bamazon_DB",
};

// database constants
const tblProducts = "products";
const colProductID = "item_id";
const colProductQuantity = "stock_quantity";

// Create a class to provide an interface with the database
// and immediately get an instance of the class
var BamazonDB = (function(username, password) {

    // Create a connection to the bamazon db
    var connection = mysql.createConnection(dbConfig);

    // Closes the database connection
    var close = function() {
        connection.end();
    };

    // Returns a promise. Passes query result to callback.
    // optional id paremeter looks up product by id
    var queryProducts = function(id) {
        // sql command
        var sql = "SELECT * FROM " + tblProducts;
        // escape sql key words
        id = connection.escape(id);

        // if an id argument was provided, update sql
        // with a WHERE clause
        if ( typeof id !== 'undefined' ) {
            sql += " WHERE " + colProductID + " = " + id;
        }
        
        // return a promise passing the result of the query
        // to the callback on succesful query
        return new Promise(
            function(resolve, reject) {
                // query the database and pass values to
                // promise callbacks
                connection.query(sql, 
                    function(err, results) {
                        // pass err to error callback
                        if (err) return reject(err);
                        // pass query results to callback
                        resolve(results);
                    }
                );
            }
        );
    };

    // Returns a promise for the eventual update of the data. Passes
    // the product id to .then callback.
    var updateQuantity = function(id, newQuantity) {
        // update query string
        var sql = "UPDATE " + tblProducts + " SET ? WHERE ?";
        // update quantity of product
        var values = {};
        values[colProductQuantity] = newQuantity;
        // query criteria
        var criteria = {};
        criteria[colProductID] = id;

        // return a promise fo the update query
        return new Promise(
            function(resolve, reject) {
                // run an update query
                connection.query(sql, [values, criteria],
                    function(err, results) {
                        // run the error callback passing the err
                        if (err) return reject(err);
                        // pass the id to the callback
                        resolve(id);
                    }
                );
            }
        );
    };

    return {
        close: close,
        queryProducts: queryProducts,
        updateQuantity: updateQuantity
    };
})();

module.exports = BamazonDB;