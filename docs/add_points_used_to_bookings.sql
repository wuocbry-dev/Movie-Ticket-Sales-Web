-- Migration: Add points_used column to bookings table
-- This allows tracking how many loyalty points were used for discount in each booking

-- Add points_used column (MySQL syntax)
-- First check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'bookings';
SET @columnname = 'points_used';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE bookings ADD COLUMN points_used INT DEFAULT 0'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Alternative simple syntax (run this if the above doesn't work):
-- ALTER TABLE bookings ADD COLUMN points_used INT DEFAULT 0;

-- Add index for better query performance on points usage reports (MySQL syntax)
-- Note: MySQL doesn't support partial indexes (WHERE clause), so we create a simple index
CREATE INDEX idx_bookings_points_used ON bookings(points_used);

-- Sample: View bookings that used points
-- SELECT booking_code, customer_name, total_amount, discount_amount, points_used 
-- FROM bookings 
-- WHERE points_used > 0 
-- ORDER BY booking_date DESC;

-- Sample: Calculate total points redeemed
-- SELECT SUM(points_used) as total_points_redeemed 
-- FROM bookings 
-- WHERE payment_status = 'COMPLETED';
