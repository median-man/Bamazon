INSERT INTO departments(name, over_head_costs)
VALUES
  ('Accessories', 2000),
  ('Sports', 2400);

INSERT INTO products(product_name, department_name, price, stock_quantity, sales)
VALUES
  ('The Bobcat Mullet', 'Accessories', 9.99, 6, 0),
  ('The AB Hancer', 'Sports', 30.00, 5, 300.00);
  
SELECT * FROM products;
SELECT * FROM departments;
