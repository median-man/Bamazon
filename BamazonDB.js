/* 
 *  This module provides an interface for the Bamazon database.
 * */

/* 
 * Import modules
 * */
const mysql = require("mysql");
const keys = require("./keys").bamazon_db;


// Create a class to provide an interface with the database
// and immediately get an instance of the class
 var BamazonDB = (function(username, password) {

    // Create a connection to the bamazon db
    var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,        
        user: username,
        password: password,
        database: "bamazon_DB"
    });

    // Closes the database connection
    var close = function() {
        connection.end();
    };

    return {
        close: close
    };
 })(keys.username, keys.password);

 BamazonDB.close();