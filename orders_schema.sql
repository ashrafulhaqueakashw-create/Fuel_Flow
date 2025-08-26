-- Order Management Database Schema for FuelFlow
-- Run this in phpMyAdmin to add order management functionality

USE fuelflow_db;

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    employee_id INT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'mobile') DEFAULT 'cash',
    status ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NULL,
    delivery_date DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Order items table (tracks individual items in each order)
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_inventory ON order_items(inventory_id);

-- Insert some sample orders (optional - for testing)
INSERT INTO orders (customer_id, total_amount, payment_method, status, delivery_address, notes, created_at) VALUES
(1, 75.50, 'card', 'pending', '123 Main St, City, State 12345', 'Please call before delivery', NOW() - INTERVAL 1 DAY),
(2, 150.25, 'cash', 'confirmed', NULL, 'Pickup at station', NOW() - INTERVAL 2 HOURS),
(1, 45.99, 'mobile', 'completed', '456 Oak Ave, City, State 12345', 'Left at front door', NOW() - INTERVAL 3 DAYS);

-- Insert corresponding order items (adjust inventory_ids based on your actual inventory)
INSERT INTO order_items (order_id, inventory_id, quantity, unit_price, total_price) VALUES
-- Order 1 items
(1, 1, 20, 3.45, 69.00),    -- 20 gallons Regular Gasoline
(1, 9, 1, 2.99, 2.99),      -- 1 Air Freshener
(1, 10, 1, 2.49, 2.49),     -- 1 Energy Drink

-- Order 2 items  
(2, 2, 40, 3.75, 150.00),   -- 40 gallons Premium Gasoline

-- Order 3 items
(3, 5, 1, 15.99, 15.99),    -- 1 Motor Oil 5W-30
(3, 13, 1, 29.99, 29.99);   -- 1 Oil Change Service
