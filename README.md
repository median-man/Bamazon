# Bamazon
Backend for an online store built with Node and MySql.

## About
Bamazon lists products from a database to a user (customer). The customer may select an item and quantity to purchase. If there is sufficient inventory of the product, the purchase is recorded in the database and the customer is provided a total for the transaction. If there is insufficient inventory, the customer is notified and no order is placed.

## Installation
1. Clone the repository from [GitHub](https://github.com/median-man/Bamazon)
2. From the command line terminal, change to the repository directory.
3. Run "npm install"
4. Setup a MySql database and server using the bamazonSchema.sql file.
5. Start the MySql server on port 3306. (You may edit bamazonCustomer.js if your MySql server is configured to run on another port by editing the connection configuration located near the top of the file.)
5. Enter your username and password for the MySql server in the keys.json file.
6. Start running the app from the terminal with the command "node bamazonCuster.js".

## Demonstration Video
[![Screenshot of Bamazon Demo](http://img.youtube.com/vi/oivuUEn2sls/0.jpg)](http://www.youtube.com/watch?v=oivuUEn2sls)

## Author
John Desrosiers
