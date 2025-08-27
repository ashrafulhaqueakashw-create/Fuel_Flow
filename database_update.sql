-- FuelFlow Orders Table Update Script
-- This script will drop the existing orders table and create a new one
-- based on the POST request structure with delivery_address as required

USE fuelflow;

-- First, drop the foreign key constraints from order_items table
-- (if it exists and references orders table)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the existing tables
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- Create the new orders table with the correct structure
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    delivery_address TEXT NOT NULL,  -- Made required as requested
    notes TEXT,  -- Optional
    employee_id INT,  -- For order assignment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (assuming these tables exist)
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create the order_items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create indexes for order_items table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_inventory_id ON order_items(inventory_id);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Display the new table structures
DESCRIBE orders;
DESCRIBE order_items;

-- Show sample data structure (this will be empty initially)
SELECT * FROM orders LIMIT 5;
SELECT * FROM order_items LIMIT 5;
