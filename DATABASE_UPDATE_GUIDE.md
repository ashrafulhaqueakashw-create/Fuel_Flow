# FuelFlow Orders Database Update Guide

## Overview

This guide walks you through updating the orders database table to match the POST request structure and make delivery_address required.

## Database Changes Required

### Step 1: Run the SQL Script

Execute the `database_update.sql` file in your MySQL database. This script will:

1. **Drop the existing orders table** (with proper foreign key handling)
2. **Create a new orders table** with the following structure:

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    delivery_address TEXT NOT NULL,  -- Now REQUIRED
    notes TEXT,  -- Optional
    employee_id INT,  -- For order assignment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);
```

### Step 2: How to Execute the SQL Script

#### Option A: Using MySQL Workbench or phpMyAdmin

1. Open MySQL Workbench or phpMyAdmin
2. Connect to your `fuelflow` database
3. Open the `database_update.sql` file
4. Execute the script

#### Option B: Using Command Line (if MySQL CLI is available)

```bash
mysql -u root -p fuelflow < database_update.sql
```

#### Option C: Using VS Code MySQL Extension

1. Install a MySQL extension in VS Code
2. Connect to your database
3. Run the SQL script

## Code Changes Made

### 1. API Route Updates (`app/api/orders/route.ts`)

- **Added validation** for required delivery_address:
  ```typescript
  if (!delivery_address || delivery_address.trim() === "") {
    return NextResponse.json(
      { success: false, message: "Delivery address is required" },
      { status: 400 }
    );
  }
  ```
- **Removed null fallback** for delivery_address in INSERT query
- **Updated SQL query** to expect delivery_address as required field

### 2. OrderForm Component Updates (`app/components/OrderForm.tsx`)

- **Updated label** from "Delivery Address (Optional)" to "Delivery Address \*" with red asterisk
- **Added required attribute** to the textarea element
- **Added client-side validation** before form submission
- **Updated placeholder text** to indicate the field is required
- **Removed null fallback** when sending to API

## New Table Structure vs POST Request Fields

### POST Request Fields:

```json
{
  "customer_id": number,
  "items": [
    {
      "inventory_id": number,
      "quantity": number
    }
  ],
  "payment_method": string,
  "delivery_address": string,  // NOW REQUIRED
  "notes": string
}
```

### Database Table Fields:

- `id` (AUTO_INCREMENT PRIMARY KEY)
- `customer_id` (from POST request)
- `total_amount` (calculated from items)
- `payment_method` (from POST request, defaults to 'cash')
- `status` (defaults to 'pending')
- `delivery_address` (from POST request, REQUIRED)
- `notes` (from POST request, optional)
- `employee_id` (for assignment, optional)
- `created_at` (automatic timestamp)
- `updated_at` (automatic timestamp)

## Testing the Changes

After running the SQL script:

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Test the order flow**:

   - Login as a customer
   - Add items to cart
   - Try to place order without delivery address (should show error)
   - Add delivery address and place order (should succeed)

3. **Verify database**:
   - Check that orders are created with all required fields
   - Verify delivery_address is never null/empty

## Benefits of These Changes

1. **Data Consistency**: All orders now have delivery addresses
2. **Better UX**: Clear indication that delivery address is required
3. **API Validation**: Server-side validation prevents invalid orders
4. **Client Validation**: Immediate feedback to users
5. **Database Integrity**: Proper constraints ensure data quality

## Important Notes

- **Backup your data** before running the SQL script if you have existing orders
- The script uses `SET FOREIGN_KEY_CHECKS = 0` to safely drop tables with foreign keys
- All existing order data will be lost when the table is dropped
- The `order_items` table structure remains unchanged and should continue to work
