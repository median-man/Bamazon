DROP DATABASE IF EXISTS bamazon_test_DB;
CREATE DATABASE bamazon_test_DB;

USE bamazon_test_DB;
CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(15) NOT NULL UNIQUE,
  over_head_costs  INT NOT NULL
);

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(15) NOT NULL,
  price DECIMAL(7,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  FOREIGN KEY (department_name) REFERENCES departments(name)
);