/* 
 *  This module provides an interface for the Bamazon database.
 * */

/* 
 * Import modules
 * */
const mysql = require("mysql");
const keys = require("./keys").bamazon_db;

// configuration settings for the database
const dbConfig = {
    user: keys.username,
    password: keys.password,
    host: "localhost",
    port: 3306,
    database: "bamazon_DB",
};

// Create a class to provide an interface with the database
// and immediately get an instance of the class
var BamazonDB = (function(username, password) {

    // Create a connection to the bamazon db
    var connection = mysql.createConnection(dbConfig);

    // Closes the database connection
    var close = function() {
        connection.end();
    };

    return {
        close: close
    };
})();

// test code
BamazonDB.close();