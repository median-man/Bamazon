# Bamazon
CLI for an online store built with Node and MySql.

## About
Bamazon lists products from a database to a user (customer). The customer may select an item and quantity to purchase. If there is sufficient inventory of the product, the purchase is recorded in the database and the customer is provided a total for the transaction. If there is insufficient inventory, the customer is notified and no order is placed.

## Usage
There are two interfaces to the app--Customer and Manager.

### Customer Interface
Start the app with `npm start`.

Customer interface allows the products to be viewed and purchased.

### Manager Interface
Start the app with `npm run manager`.

Manager interface provides the ability to do the following:
* View all products
* View products with low inventory
* Edit the inventory of a product
* Add a product

### Supervisor interface
Start the app with `npm run super`.

Supervisor interface provides the ability to do the following:
* View sales by department.
* Add new department

## Installation
1. Clone the repository from [GitHub](https://github.com/median-man/Bamazon)
2. From the command line terminal, change to the repository directory.
3. Run `npm install`
4. Setup a MySql database and server using the createBamazonDB.sql file.
5. Optional seed the database with seeds.sql file.
6. Ensure MySql server is running.
7. Edit the username, password, and other database configuration fields as necessary to allow
Bamazon to connect to a MySql database.
```json
"dev": {
    "user": "USERNAME",
    "password": "PASSWORD",
    "host": "localhost",
    "port": 3306,
    "database": "bamazon_DB"
  }
```

## Demonstration Video
Click on the image to see a demo video of the customer interface.
[![Screenshot of Bamazon Demo](http://img.youtube.com/vi/oivuUEn2sls/0.jpg)](http://www.youtube.com/watch?v=oivuUEn2sls)

## To Do
* create supervisor mode feature (feat/super)
* handle mysql connection errors gracefully (feat/mysql-con-errors)

### Supervisor Mode (feature request)
* add departmentSales method to bamazonDb
* add departmentSales view to supervisor app
* add getNewDepartmentName to supervisor view
* add addDepartment method to bamazonDb
* view sales by department (feat/super)
* create department (feat/super)

---
Created by John Desrosiers. 2017
