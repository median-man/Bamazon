# Depts Branch

## Modify createBamazonDB.sql
Create a departments table with the following columns:
* department_id
* department_name (VARCHAR 15, unique)
* over_head_costs (INT)

The products table create statement should reference department_name as a foreign key referencing
the departments table.

Example of creating a foreign key reference:
```sql
CREATE TABLE parent (
    id INT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=INNODB;

CREATE TABLE child (
    id INT,
    parent_id INT,
    INDEX par_ind (parent_id),
    FOREIGN KEY (parent_id)
        REFERENCES parent(id)
        ON DELETE CASCADE
) ENGINE=INNODB;
```
From [Examples of Foreign Key Clauses](https://dev.mysql.com/doc/refman/5.7/en/create-table-foreign-keys.html#idm140433700739376)

## Modify seeds.sql
* Seeds should remove all data from tables before seeding new data.
* Seed the departments table
* The products table seeds must not contain product names which are not contained.

## Add getDeptList method to BamazonDB object
Returns an array of row objects containing all data from the departments table.

## Modify Manager/Add Product feature
* Managers should be presented a list of departments to choose from when adding a department.
* Managers should not be able to enter a value that is not in the list.
