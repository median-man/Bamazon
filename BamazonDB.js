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
    var queryProducts = function() {
        // sql command
        var sql = "SELECT * FROM " + tblProducts;
        return new Promise(
            function(resolve, reject) {
                // query the data base and pass values to
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

    return {
        close: close,
        queryProducts: queryProducts
    };
})();

// test code
BamazonDB.queryProducts().then(console.log);
BamazonDB.close();

module.exports = BamazonDB;