DROP DATABASE IF EXISTS bamazon_test_DB;

CREATE DATABASE bamazonTest_DB;

USE bamazonTest_DB;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(7,2) default 0,
  stock_quantity INT default 0,
  PRIMARY KEY (item_id));

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES
  ('Nostalgia Electrics BSET100CR 3 in 1 Breakfast Station', 'Home', 69.99, 3),
  ('The AB Hancer', 'Sports', 30.00, 300);