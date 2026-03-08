-- Fix: Change format_type from ENUM to VARCHAR to match JPA AttributeConverter
-- This allows the FormatTypeConverter to store display values (2D, 3D, etc.)

USE movie_ticket_sales;

-- First, check current data
SELECT DISTINCT format_type FROM showtimes;

-- Modify format_type column from ENUM to VARCHAR(20)
ALTER TABLE showtimes 
MODIFY COLUMN format_type VARCHAR(20) DEFAULT '2D';

-- Verify the change
SHOW COLUMNS FROM showtimes LIKE 'format_type';
