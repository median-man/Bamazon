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

INSERT INTO departments(name, over_head_costs)
VALUES
  ('Home', 2000),
  ('Sports', 2400);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES
  ('Nostalgia Electrics BSET100CR 3 in 1 Breakfast Station', 'Home', 69.99, 3),
  ('The AB Hancer', 'Sports', 30.00, 300);
  
-- SELECT * FROM products;
-- SELECT * FROM departments; 