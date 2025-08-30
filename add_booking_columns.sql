-- Add missing columns to bookings table for Smart Booking System
-- NOTE: Some of these columns may already exist. Run this via the API endpoint instead:
-- POST http://localhost:3001/api/admin/update-booking-columns

-- To run these manually, execute one by one and ignore "Duplicate column name" errors

-- Add customer information columns (ignore if already exist)
-- ALTER TABLE bookings ADD COLUMN customer_email VARCHAR(255) NOT NULL DEFAULT 'guest@fuelflow.com';
-- ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT 'Guest Customer';

-- Add fuel and pricing columns (ignore if already exist)
-- ALTER TABLE bookings ADD COLUMN fuel_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
-- ALTER TABLE bookings ADD COLUMN price_per_liter DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
-- ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
-- ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00;

-- Add delivery and payment columns (ignore if already exist)
-- ALTER TABLE bookings ADD COLUMN delivery_address TEXT;
-- ALTER TABLE bookings ADD COLUMN payment_method ENUM('credit_card', 'debit_card', 'cash', 'online') DEFAULT 'online';
-- ALTER TABLE bookings ADD COLUMN special_instructions TEXT;

-- Add status tracking columns (ignore if already exist)
-- ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending';
-- ALTER TABLE bookings ADD COLUMN booking_status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed';

-- Add timestamps if they don't exist (ignore if already exist)
-- ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- RECOMMENDED: Use the API endpoint instead which handles duplicate columns gracefully
-- POST http://localhost:3001/api/admin/update-booking-columns
