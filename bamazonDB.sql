-- SQL to create the Bamazon database and populate the products table
DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(7,2) default 0,
  stock_quantity INT default 0,
  PRIMARY KEY (item_id)
);



-- populate database
INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES
	("Nostalgia Electrics BSET100CR 3 in 1 Breakfast Station", "Home", 69.99, 3),
    ("The AB Hancer", "Sports", 30.00, 300),
    ("Animal Footprint Shoes", "Clothing", 24.99, 1),
    ("The Face Exercise Mouthpiece", "Health", 9.99, 5),
    ("Bacon Bandages", "Health", 9.99, 2),
    ("Bacon Flavored Toothpaste", "Health", 3.99, 15),
    ("The Amazing Banana Slicer", "Home", 6.99, 7),
    ("Baseball Bat Pepper Grinder", "Home", 19.99, 2),
    ("The Boyfriend Arm Pillow", "Home", 14.99, 4),
    ("Sleep at Work Stickers", "Office", 4.99, 50),
    ("Cupcake Flavored Dental Floss", "Health", 3.99, 6),
    ("Deer Rear with Bottle Opene", "Home", 12.99, 2),
    ("The Defibrillator Toaster", "Home", 27.99, 3),
    ("EMERGENCY MOUSTACHE KIT", "Health", 14.99, 8);
    
-- SELECT * FROM products;