CREATE TABLE IF NOT EXISTS time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INT DEFAULT 10,
  current_bookings INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  congestion_level ENUM('low', 'medium', 'high') DEFAULT 'low',
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_slot (date, start_time),
  INDEX idx_date (date),
  INDEX idx_availability (is_available),
  INDEX idx_congestion (congestion_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fuel_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fuel_type ENUM('petrol', 'diesel', 'gas') NOT NULL,
  price_per_liter DECIMAL(10,2) NOT NULL,
  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fuel_type (fuel_type),
  INDEX idx_current (is_current),
  INDEX idx_effective (effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  fuel_type ENUM('petrol', 'diesel', 'gas') NOT NULL,
  quantity_liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(5,2) DEFAULT 0.00,
  final_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  booking_status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
  payment_method ENUM('card', 'wallet', 'cod') DEFAULT 'card',
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id),
  INDEX idx_time_slot (time_slot_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_booking_status (booking_status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample time slots for the next 7 days
INSERT INTO time_slots (date, start_time, end_time, max_capacity, congestion_level, discount_percentage) VALUES
(CURDATE(), '08:00:00', '10:00:00', 10, 'low', 15.00),
(CURDATE(), '10:00:00', '12:00:00', 15, 'medium', 10.00),
(CURDATE(), '12:00:00', '14:00:00', 20, 'high', 0.00),
(CURDATE(), '14:00:00', '16:00:00', 20, 'high', 0.00),
(CURDATE(), '16:00:00', '18:00:00', 15, 'medium', 5.00),
(CURDATE(), '18:00:00', '20:00:00', 10, 'low', 20.00),

(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', 10, 'low', 15.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:00:00', 15, 'medium', 10.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', '14:00:00', 20, 'high', 0.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00', 20, 'high', 0.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', '18:00:00', 15, 'medium', 5.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:00:00', 10, 'low', 20.00),

(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '10:00:00', 10, 'low', 15.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', 15, 'medium', 10.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:00:00', '14:00:00', 20, 'high', 0.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '16:00:00', 20, 'high', 0.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00', '18:00:00', 15, 'medium', 5.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '20:00:00', 10, 'low', 20.00);

-- Insert current fuel prices
INSERT INTO fuel_prices (fuel_type, price_per_liter, is_current) VALUES
('petrol', 1.45, TRUE),
('diesel', 1.38, TRUE),
('gas', 0.85, TRUE);
