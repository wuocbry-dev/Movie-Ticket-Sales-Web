-- =================================================================
-- HIBERNATE COMPATIBILITY FIXES FOR MOVIE TICKET SALES DATABASE
-- =================================================================
-- Sửa các vấn đề tương thích giữa MySQL ENUM và Hibernate
-- Ngày tạo: 2025-10-15
-- =================================================================

USE movie_ticket_sales;

-- =================================================================
-- 1. SỬA LỖI ENUM COLUMNS - CHUYỂN SANG VARCHAR
-- =================================================================

-- Fix bookings table - payment_status
ALTER TABLE bookings 
MODIFY COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING'
CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'));

-- Fix bookings table - status
ALTER TABLE bookings 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'REFUNDED'));

-- Fix users table - gender
ALTER TABLE users 
MODIFY COLUMN gender VARCHAR(10)
CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'));

-- Fix movies table - age_rating
ALTER TABLE movies 
MODIFY COLUMN age_rating VARCHAR(10) NOT NULL
CHECK (age_rating IN ('P', 'K', 'T13', 'T16', 'T18'));

-- Fix movies table - status
ALTER TABLE movies 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'COMING_SOON'
CHECK (status IN ('COMING_SOON', 'NOW_SHOWING', 'END_SHOWING'));

-- Fix cinema_halls table - hall_type
ALTER TABLE cinema_halls 
MODIFY COLUMN hall_type VARCHAR(20) DEFAULT '2D'
CHECK (hall_type IN ('2D', '3D', 'IMAX', '4DX', 'SCREENX'));

-- Fix seats table - seat_type
ALTER TABLE seats 
MODIFY COLUMN seat_type VARCHAR(20) DEFAULT 'STANDARD'
CHECK (seat_type IN ('STANDARD', 'VIP', 'COUPLE', 'WHEELCHAIR'));

-- Fix showtimes table - format_type
ALTER TABLE showtimes 
MODIFY COLUMN format_type VARCHAR(20) DEFAULT '2D'
CHECK (format_type IN ('2D', '3D', 'IMAX', '4DX', 'SCREENX'));

-- Fix showtimes table - status
ALTER TABLE showtimes 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'SCHEDULED'
CHECK (status IN ('SCHEDULED', 'SELLING', 'SOLD_OUT', 'CANCELLED'));

-- Fix tickets table - status
ALTER TABLE tickets 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'BOOKED'
CHECK (status IN ('BOOKED', 'PAID', 'USED', 'CANCELLED', 'REFUNDED'));

-- Fix memberships table - status
ALTER TABLE memberships 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'
CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED'));

-- Fix points_transactions table - transaction_type
ALTER TABLE points_transactions 
MODIFY COLUMN transaction_type VARCHAR(20) NOT NULL
CHECK (transaction_type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'GIFT'));

-- Fix points_transactions table - source_type
ALTER TABLE points_transactions 
MODIFY COLUMN source_type VARCHAR(20) NOT NULL
CHECK (source_type IN ('BOOKING', 'BONUS', 'BIRTHDAY', 'REFERRAL', 'PROMOTION', 'MANUAL', 'CONCESSION'));

-- Fix promotions table - promotion_type
ALTER TABLE promotions 
MODIFY COLUMN promotion_type VARCHAR(30) NOT NULL
CHECK (promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_ITEM', 'POINTS_MULTIPLIER'));

-- Fix promotions table - rule_type
ALTER TABLE pricing_rules 
MODIFY COLUMN rule_type VARCHAR(20) NOT NULL
CHECK (rule_type IN ('SURCHARGE', 'DISCOUNT', 'FIXED_PRICE'));

-- Fix user_vouchers table - status
ALTER TABLE user_vouchers 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'AVAILABLE'
CHECK (status IN ('AVAILABLE', 'USED', 'EXPIRED', 'CANCELLED'));

-- Fix concession_orders table - status
ALTER TABLE concession_orders 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'));

-- Fix concession_orders table - payment_status
ALTER TABLE concession_orders 
MODIFY COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING'
CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED'));

-- Fix payments table - payment_method
ALTER TABLE payments 
MODIFY COLUMN payment_method VARCHAR(30) NOT NULL
CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'CASH', 'POINTS', 'VOUCHER'));

-- Fix payments table - status
ALTER TABLE payments 
MODIFY COLUMN status VARCHAR(20) NOT NULL
CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'));

-- Fix refunds table - refund_method
ALTER TABLE refunds 
MODIFY COLUMN refund_method VARCHAR(30) NOT NULL
CHECK (refund_method IN ('ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'POINTS', 'GIFT_CARD'));

-- Fix refunds table - reason
ALTER TABLE refunds 
MODIFY COLUMN reason VARCHAR(30) NOT NULL
CHECK (reason IN ('CUSTOMER_REQUEST', 'SHOWTIME_CANCELLED', 'TECHNICAL_ERROR', 'FRAUD'));

-- Fix refunds table - status
ALTER TABLE refunds 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'));

-- Fix system_logs table - log_level
ALTER TABLE system_logs 
MODIFY COLUMN log_level VARCHAR(20) NOT NULL
CHECK (log_level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'));

-- Fix system_configurations table - data_type
ALTER TABLE system_configurations 
MODIFY COLUMN data_type VARCHAR(20) DEFAULT 'STRING'
CHECK (data_type IN ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON'));

-- Fix notifications table - notification_type
ALTER TABLE notifications 
MODIFY COLUMN notification_type VARCHAR(20) DEFAULT 'INFO'
CHECK (notification_type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PROMOTIONAL'));

-- =================================================================
-- 2. THÊM INDEXES CHO PERFORMANCE (SAU KHI SỬA ENUM)
-- =================================================================

-- Thêm indexes cho các column đã sửa
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_showtimes_status ON showtimes(status);
CREATE INDEX idx_payments_status ON payments(status);

-- =================================================================
-- 3. CẬP NHẬT DỮ LIỆU MẪU (NẾU CẦN)
-- =================================================================

-- Cập nhật dữ liệu có sẵn để đảm bảo tương thích
UPDATE bookings SET payment_status = 'PENDING' WHERE payment_status IS NULL;
UPDATE bookings SET status = 'PENDING' WHERE status IS NULL;
UPDATE movies SET status = 'COMING_SOON' WHERE status IS NULL;
UPDATE showtimes SET status = 'SCHEDULED' WHERE status IS NULL;

-- =================================================================
-- HOÀN THÀNH
-- =================================================================

SELECT 'Database schema fixed for Hibernate compatibility!' AS Status;