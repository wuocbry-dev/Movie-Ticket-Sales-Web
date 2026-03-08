-- =================================================================
-- MOVIE TICKET SALES WEB PROJECT - SAMPLE DATA
-- =================================================================
-- Sample data for testing and development
-- Đảm bảo logic nghiệp vụ và mối quan hệ giữa các bảng
-- Version: 1.0
-- Date: 2025-10-18
-- =================================================================

USE movie_ticket_sales;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =================================================================
-- 1. ROLES AND USERS
-- =================================================================

-- Insert roles (if not already inserted)
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'CUSTOMER', 'Khách hàng thông thường'),
(2, 'CINEMA_STAFF', 'Nhân viên rạp'),
(3, 'CINEMA_MANAGER', 'Quản lý rạp'),
(4, 'SYSTEM_ADMIN', 'Quản trị viên hệ thống');

-- Insert sample users
INSERT INTO users (user_id, email, phone_number, password_hash, full_name, date_of_birth, gender, is_active, is_email_verified) VALUES
-- Admin users
(1, 'admin@movietickets.com', '0901234567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Administrator', '1990-01-01', 'MALE', true, true),
-- Staff users
(2, 'staff1@movietickets.com', '0901234568', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Nguyễn Văn A', '1995-05-15', 'MALE', true, true),
(3, 'staff2@movietickets.com', '0901234569', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Trần Thị B', '1993-08-20', 'FEMALE', true, true),
-- Regular customers
(4, 'customer1@gmail.com', '0901234570', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Lê Văn C', '1998-03-10', 'MALE', true, true),
(5, 'customer2@gmail.com', '0901234571', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Phạm Thị D', '2000-12-25', 'FEMALE', true, true),
(6, 'customer3@gmail.com', '0901234572', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6', 'Hoàng Văn E', '1997-07-18', 'MALE', true, true);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 4, 1), -- Admin has SYSTEM_ADMIN role
(2, 2, 1), -- Staff 1 has CINEMA_STAFF role
(3, 2, 1), -- Staff 2 has CINEMA_STAFF role
(4, 1, 1), -- Customers have CUSTOMER role
(5, 1, 1),
(6, 1, 1);

-- =================================================================
-- 2. CINEMA CHAINS AND LOCATIONS
-- =================================================================

-- Insert cinema chains
INSERT INTO cinema_chains (chain_id, chain_name, description) VALUES
(1, 'CGV Cinemas', 'Hệ thống rạp chiếu phim CGV tại Việt Nam'),
(2, 'Galaxy Cinema', 'Hệ thống rạp chiếu phim Galaxy'),
(3, 'Lotte Cinema', 'Hệ thống rạp chiếu phim Lotte'),
(4, 'BHD Star Cineplex', 'Hệ thống rạp chiếu phim BHD Star');

-- Insert cinemas
INSERT INTO cinemas (cinema_id, chain_id, cinema_name, address, city, district, phone_number, email, tax_code) VALUES
(1, 1, 'CGV Vincom Center', '72 Lê Thánh Tôn, Bến Nghé', 'Hồ Chí Minh', 'Quận 1', '02838277747', 'cgv.vincom@cgv.vn', '0123456789'),
(2, 1, 'CGV Aeon Mall', '30 Bờ Bao Tân Thắng, Sơn Kỳ', 'Hồ Chí Minh', 'Tân Phú', '02838477748', 'cgv.aeonmall@cgv.vn', '0123456790'),
(3, 2, 'Galaxy MIPEC Tower', '229 Tây Sơn', 'Hà Nội', 'Đống Đa', '02432222333', 'galaxy.mipec@galaxy.vn', '0123456791'),
(4, 3, 'Lotte Cinema Landmark', '5B Tôn Đức Thắng, Bến Nghé', 'Hồ Chí Minh', 'Quận 1', '02838222333', 'lotte.landmark@lotte.vn', '0123456792'),
(5, 4, 'BHD Star Phạm Hùng', 'Tầng 4, TTTM The Garden', 'Hà Nội', 'Nam Từ Liêm', '02437878999', 'bhd.phamhung@bhd.vn', '0123456793');

-- Insert cinema halls
INSERT INTO cinema_halls (hall_id, cinema_id, hall_name, hall_type, total_seats, rows_count, seats_per_row) VALUES
(1, 1, 'Cinema 1', '2D', 120, 10, 12),
(2, 1, 'Cinema 2', '3D', 100, 10, 10),
(3, 1, 'IMAX', 'IMAX', 160, 10, 16),
(4, 2, 'Cinema 1', '2D', 100, 10, 10),
(5, 2, 'Cinema 2', '3D', 100, 10, 10),
(6, 3, 'Cinema 1', '2D', 120, 10, 12),
(7, 4, 'Cinema 1', '2D', 100, 10, 10),
(8, 5, 'Cinema 1', '2D', 120, 10, 12);

-- Insert seats (example for one hall)
INSERT INTO seats (hall_id, seat_row, seat_number, seat_type) 
SELECT 
    1, -- hall_id for Cinema 1
    CHAR(65 + (number - 1) DIV 12), -- Generates A-J
    ((number - 1) % 12) + 1, -- Generates 1-12
    CASE 
        WHEN CHAR(65 + (number - 1) DIV 12) IN ('A', 'B') THEN 'STANDARD'
        WHEN CHAR(65 + (number - 1) DIV 12) IN ('C', 'D', 'E', 'F') THEN 'VIP'
        WHEN CHAR(65 + (number - 1) DIV 12) IN ('G', 'H') THEN 'COUPLE'
        ELSE 'STANDARD'
    END
FROM (
    SELECT a.N + b.N * 10 + 1 as number
    FROM 
        (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
        (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
    ORDER BY number
    LIMIT 120
) numbers;

-- =================================================================
-- 3. MOVIES AND GENRES
-- =================================================================

-- Insert movie genres
INSERT INTO movie_genres (genre_id, genre_name, genre_name_en) VALUES
(1, 'Hành động', 'Action'),
(2, 'Phiêu lưu', 'Adventure'),
(3, 'Hài hước', 'Comedy'),
(4, 'Chính kịch', 'Drama'),
(5, 'Kinh dị', 'Horror'),
(6, 'Khoa học viễn tưởng', 'Sci-Fi'),
(7, 'Lãng mạn', 'Romance'),
(8, 'Hoạt hình', 'Animation'),
(9, 'Tài liệu', 'Documentary'),
(10, 'Gia đình', 'Family');

-- Insert movies
INSERT INTO movies (movie_id, title, title_en, age_rating, duration_minutes, release_date, end_date, country, language, status) VALUES
(1, 'Người Nhện: Không Còn Nhà', 'Spider-Man: No Way Home', 'T13', 148, '2025-10-01', '2025-11-30', 'USA', 'English', 'NOW_SHOWING'),
(2, 'Báo Đen: Wakanda Mãi Mãi', 'Black Panther: Wakanda Forever', 'T13', 161, '2025-10-05', '2025-11-30', 'USA', 'English', 'NOW_SHOWING'),
(3, 'Doraemon: Nobita và Vùng Đất Lý Tưởng Trên Bầu Trời', 'Doraemon: Nobitas Sky Utopia', 'P', 108, '2025-10-10', '2025-11-15', 'Japan', 'Japanese', 'NOW_SHOWING'),
(4, 'Oppenheimer', 'Oppenheimer', 'T18', 180, '2025-10-15', '2025-12-15', 'USA', 'English', 'NOW_SHOWING'),
(5, 'Tấm Cám: Chuyện Chưa Kể', 'Tam Cam: The Untold Story', 'T13', 115, '2025-11-01', NULL, 'Vietnam', 'Vietnamese', 'COMING_SOON');

-- Map movies to genres
INSERT INTO movie_genre_mapping (movie_id, genre_id) VALUES
(1, 1), (1, 2), (1, 6), -- Spider-Man: Action, Adventure, Sci-Fi
(2, 1), (2, 2), (2, 4), -- Black Panther: Action, Adventure, Drama
(3, 8), (3, 10), -- Doraemon: Animation, Family
(4, 4), (4, 2), -- Oppenheimer: Drama, Adventure
(5, 4), (5, 7); -- Tấm Cám: Drama, Romance

-- =================================================================
-- 4. SHOWTIMES AND PRICING
-- =================================================================

-- Insert showtimes for today and next few days
INSERT INTO showtimes (showtime_id, movie_id, hall_id, show_date, start_time, end_time, format_type, base_price, available_seats) VALUES
-- Showtimes for Spider-Man
(1, 1, 1, CURDATE(), '10:00:00', '12:28:00', '2D', 90000, 120),
(2, 1, 2, CURDATE(), '13:00:00', '15:28:00', '3D', 120000, 100),
(3, 1, 3, CURDATE(), '16:00:00', '18:28:00', 'IMAX', 150000, 160),
-- Showtimes for Black Panther
(4, 2, 4, CURDATE(), '11:00:00', '13:41:00', '2D', 90000, 100),
(5, 2, 5, CURDATE(), '14:00:00', '16:41:00', '3D', 120000, 100),
-- Showtimes for Doraemon
(6, 3, 6, CURDATE(), '09:00:00', '10:48:00', '2D', 75000, 120),
(7, 3, 6, CURDATE(), '13:00:00', '14:48:00', '2D', 75000, 120),
-- Showtimes for Oppenheimer
(8, 4, 7, CURDATE(), '14:00:00', '17:00:00', '2D', 90000, 100),
(9, 4, 8, CURDATE(), '19:00:00', '22:00:00', '2D', 90000, 120);

-- Insert pricing rules
INSERT INTO pricing_rules (rule_id, rule_name, description, rule_type, amount, percentage, valid_from, valid_to) VALUES
(1, 'Giảm giá thứ 3 hàng tuần', 'Giảm 20% cho mọi suất chiếu vào thứ 3', 'DISCOUNT', NULL, 20.00, '2025-01-01', '2025-12-31'),
(2, 'Phụ thu cuối tuần', 'Tăng 10% giá vé cho các suất chiếu cuối tuần', 'SURCHARGE', NULL, 10.00, '2025-01-01', '2025-12-31'),
(3, 'Happy Hour sáng sớm', 'Giảm 30% cho suất chiếu trước 12h', 'DISCOUNT', NULL, 30.00, '2025-01-01', '2025-12-31'),
(4, 'Giá cố định U22', 'Giá cố định 50.000đ cho khách hàng dưới 22 tuổi', 'FIXED_PRICE', 50000, NULL, '2025-01-01', '2025-12-31');

-- =================================================================
-- 5. MEMBERSHIP AND LOYALTY
-- =================================================================

-- Insert membership tiers
INSERT INTO membership_tiers (tier_id, tier_name, tier_name_display, min_annual_spending, points_earn_rate, tier_level, birthday_gift_description) VALUES
(1, 'BRONZE', 'Thành viên Đồng', 0, 1.0, 1, 'Combo bắp nước sinh nhật'),
(2, 'SILVER', 'Thành viên Bạc', 2000000, 1.2, 2, 'Combo bắp nước + 1 vé 2D'),
(3, 'GOLD', 'Thành viên Vàng', 5000000, 1.5, 3, 'Combo bắp nước + 2 vé 2D/3D'),
(4, 'PLATINUM', 'Thành viên Bạch Kim', 10000000, 2.0, 4, 'Combo bắp nước + 3 vé mọi định dạng'),
(5, 'DIAMOND', 'Thành viên Kim Cương', 20000000, 2.5, 5, 'Combo bắp nước + 5 vé mọi định dạng + ưu tiên đặt chỗ');

-- Insert memberships for sample customers
INSERT INTO memberships (membership_id, user_id, membership_number, tier_id, total_points, available_points, lifetime_spending) VALUES
(1, 4, 'MEM001', 1, 100, 100, 500000), -- Bronze member
(2, 5, 'MEM002', 2, 2500, 2000, 2500000), -- Silver member
(3, 6, 'MEM003', 3, 5500, 5000, 6000000); -- Gold member

-- =================================================================
-- 6. CONCESSION (FOOD & BEVERAGES)
-- =================================================================

-- Insert concession categories
INSERT INTO concession_categories (category_id, category_name, description, display_order) VALUES
(1, 'Combo Bắp Nước', 'Các combo bắp rang bơ và nước uống', 1),
(2, 'Đồ uống', 'Nước ngọt, nước ép, trà sữa', 2),
(3, 'Snacks', 'Kẹo, bánh kẹo các loại', 3),
(4, 'Thức ăn nhanh', 'Hotdog, bánh mì, nachos', 4);

-- Insert concession items
INSERT INTO concession_items (item_id, category_id, item_name, price, size, stock_quantity) VALUES
-- Combos
(1, 1, 'Combo 1: Bắp + Coca', 79000, 'M', 100),
(2, 1, 'Combo 2: Bắp + 2 Coca', 99000, 'L', 100),
(3, 1, 'Combo Gia đình: Bắp + 4 Coca', 159000, 'XL', 50),
-- Drinks
(4, 2, 'Coca-Cola', 29000, 'M', 200),
(5, 2, 'Sprite', 29000, 'M', 200),
(6, 2, 'Trà sữa trân châu', 45000, 'M', 100),
-- Snacks
(7, 3, 'Bắp rang bơ', 45000, 'M', 150),
(8, 3, 'Khoai tây chiên', 39000, 'M', 100),
-- Fast Food
(9, 4, 'Hotdog', 45000, 'M', 50),
(10, 4, 'Nachos phô mai', 55000, 'M', 50);

-- =================================================================
-- 7. PROMOTIONS AND VOUCHERS
-- =================================================================

-- Insert promotions
INSERT INTO promotions (promotion_id, promotion_code, promotion_name, promotion_type, discount_percentage, min_purchase_amount, start_date, end_date) VALUES
(1, 'WELCOME2025', 'Chào mừng 2025', 'PERCENTAGE', 15.00, 100000, '2025-01-01', '2025-12-31'),
(2, 'BIRTHDAY25', 'Quà sinh nhật', 'PERCENTAGE', 25.00, 0, '2025-01-01', '2025-12-31'),
(3, 'MEMBER50K', 'Giảm 50K cho thành viên', 'FIXED_AMOUNT', NULL, 200000, '2025-10-01', '2025-12-31');

-- Insert vouchers for sample users
INSERT INTO user_vouchers (voucher_id, user_id, promotion_id, voucher_code, status, expires_at) VALUES
(1, 4, 1, 'WELCOME2025-001', 'AVAILABLE', '2025-12-31 23:59:59'),
(2, 5, 2, 'BIRTHDAY25-001', 'AVAILABLE', '2025-12-31 23:59:59'),
(3, 6, 3, 'MEMBER50K-001', 'AVAILABLE', '2025-12-31 23:59:59');

-- =================================================================
-- 8. SAMPLE BOOKINGS AND TRANSACTIONS
-- =================================================================

-- Insert sample bookings
INSERT INTO bookings (booking_id, booking_code, user_id, showtime_id, total_seats, subtotal, total_amount, status, payment_status) VALUES
(1, 'BK20251018001', 4, 1, 2, 180000, 180000, 'PAID', 'COMPLETED'),
(2, 'BK20251018002', 5, 4, 3, 270000, 270000, 'PAID', 'COMPLETED'),
(3, 'BK20251018003', 6, 6, 4, 300000, 300000, 'PENDING', 'PENDING');

-- Insert tickets for the bookings
INSERT INTO tickets (ticket_id, booking_id, seat_id, ticket_code, base_price, final_price, status) VALUES
-- Booking 1 tickets
(1, 1, 1, 'TK20251018001-1', 90000, 90000, 'PAID'),
(2, 1, 2, 'TK20251018001-2', 90000, 90000, 'PAID'),
-- Booking 2 tickets
(3, 2, 45, 'TK20251018002-1', 90000, 90000, 'PAID'),
(4, 2, 46, 'TK20251018002-2', 90000, 90000, 'PAID'),
(5, 2, 47, 'TK20251018002-3', 90000, 90000, 'PAID'),
-- Booking 3 tickets
(6, 3, 72, 'TK20251018003-1', 75000, 75000, 'BOOKED'),
(7, 3, 73, 'TK20251018003-2', 75000, 75000, 'BOOKED'),
(8, 3, 74, 'TK20251018003-3', 75000, 75000, 'BOOKED'),
(9, 3, 75, 'TK20251018003-4', 75000, 75000, 'BOOKED');

-- Insert payments for the bookings
INSERT INTO payments (payment_id, booking_id, payment_reference, payment_method, amount, status, completed_at) VALUES
(1, 1, 'PAY20251018001', 'CREDIT_CARD', 180000, 'COMPLETED', NOW()),
(2, 2, 'PAY20251018002', 'E_WALLET', 270000, 'COMPLETED', NOW()),
(3, 3, 'PAY20251018003', 'BANK_TRANSFER', 300000, 'PENDING', NULL);

-- Insert concession orders
INSERT INTO concession_orders (concession_order_id, booking_id, user_id, order_number, cinema_id, subtotal, total_amount, status, payment_status) VALUES
(1, 1, 4, 'CO20251018001', 1, 79000, 79000, 'COMPLETED', 'PAID'),
(2, 2, 5, 'CO20251018002', 2, 159000, 159000, 'COMPLETED', 'PAID');

-- Insert concession order items
INSERT INTO concession_order_items (concession_order_id, item_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 79000, 79000), -- Combo 1
(2, 3, 1, 159000, 159000); -- Combo Gia đình

-- Insert points transactions
INSERT INTO points_transactions (user_id, transaction_type, points_amount, source_type, source_id, balance_before, balance_after) VALUES
(4, 'EARN', 180, 'BOOKING', 1, 100, 280),
(5, 'EARN', 270, 'BOOKING', 2, 2000, 2270),
(6, 'EARN', 300, 'BOOKING', 3, 5000, 5300);

-- =================================================================
-- 9. VERIFY DATA INTEGRITY
-- =================================================================

-- Verify user roles
SELECT u.user_id, u.email, r.role_name 
FROM users u 
JOIN user_roles ur ON u.user_id = ur.user_id 
JOIN roles r ON ur.role_id = r.role_id;

-- Verify movie schedules
SELECT m.title, c.cinema_name, ch.hall_name, s.show_date, s.start_time, s.format_type, s.base_price 
FROM showtimes s
JOIN movies m ON s.movie_id = m.movie_id
JOIN cinema_halls ch ON s.hall_id = ch.hall_id
JOIN cinemas c ON ch.cinema_id = c.cinema_id
WHERE s.show_date >= CURDATE()
ORDER BY s.show_date, s.start_time;

-- Verify bookings and payments
SELECT b.booking_code, u.full_name, m.title, s.show_date, b.total_amount, b.status, p.payment_method, p.status as payment_status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN showtimes s ON b.showtime_id = s.showtime_id
JOIN movies m ON s.movie_id = m.movie_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
ORDER BY b.booking_date DESC;

-- Verify membership points
SELECT u.full_name, mt.tier_name, m.total_points, m.available_points, m.lifetime_spending
FROM memberships m
JOIN users u ON m.user_id = u.user_id
JOIN membership_tiers mt ON m.tier_id = mt.tier_id;

-- =================================================================
-- END OF SAMPLE DATA
-- =================================================================

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Sample data inserted successfully!' as Status;
-- 1. INSERT ROLES (vai trò)
-- =================================================================

DELETE FROM user_sessions;
DELETE FROM points_transactions;
DELETE FROM refunds;
DELETE FROM payments;
DELETE FROM concession_order_items;
DELETE FROM concession_orders;
DELETE FROM user_vouchers;
DELETE FROM promotions;
DELETE FROM tickets;
DELETE FROM bookings;
DELETE FROM pricing_rules;
DELETE FROM showtimes;
DELETE FROM user_roles;
DELETE FROM user_vouchers;
DELETE FROM memberships;
DELETE FROM movies;
DELETE FROM movie_genre_mapping;
DELETE FROM movie_genres;
DELETE FROM seats;
DELETE FROM cinema_halls;
DELETE FROM cinemas;
DELETE FROM cinema_chains;
DELETE FROM membership_tiers;
DELETE FROM concession_order_items;
DELETE FROM concession_items;
DELETE FROM concession_categories;
DELETE FROM notifications;
DELETE FROM system_logs;
DELETE FROM system_configurations;
DELETE FROM roles;
DELETE FROM users;

-- Reset auto increment
ALTER TABLE roles AUTO_INCREMENT = 1;

INSERT INTO roles (role_id, role_name, description, created_at) VALUES 
(1, 'CUSTOMER', 'Khách hàng thường', NOW()),
(2, 'CINEMA_STAFF', 'Nhân viên rạp chiếu phim', NOW()),
(3, 'CINEMA_MANAGER', 'Quản lý rạp chiếu phim', NOW()),
(4, 'SYSTEM_ADMIN', 'Quản trị viên hệ thống', NOW());

-- =================================================================
-- 2. INSERT USERS (người dùng)
-- =================================================================

ALTER TABLE users AUTO_INCREMENT = 1;

-- Admin user
INSERT INTO users (
    user_id, email, phone_number, password_hash, full_name, date_of_birth, gender,
    is_active, is_email_verified, privacy_policy_accepted, privacy_policy_version,
    privacy_policy_accepted_at, terms_of_service_accepted, terms_of_service_version,
    terms_of_service_accepted_at, created_at, updated_at
) VALUES (
    1, 'admin@example.com', '0900000001',
    '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK', -- password: Admin@123
    'Nguyễn Văn Admin', '1990-01-01', 'MALE',
    TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()
);

-- Regular customers
INSERT INTO users (
    user_id, email, phone_number, password_hash, full_name, date_of_birth, gender,
    is_active, is_email_verified, privacy_policy_accepted, privacy_policy_version,
    privacy_policy_accepted_at, terms_of_service_accepted, terms_of_service_version,
    terms_of_service_accepted_at, created_at, updated_at
) VALUES 
(2, 'customer1@example.com', '0901234567',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK', -- password: Customer@123
 'Trần Thị Hương', '1995-05-15', 'FEMALE',
 TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()),

(3, 'customer2@example.com', '0902345678',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK',
 'Phạm Quốc Hải', '1998-03-22', 'MALE',
 TRUE, FALSE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()),

(4, 'customer3@example.com', '0903456789',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK',
 'Lê Minh Khôi', '2000-07-10', 'MALE',
 TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()),

(5, 'customer4@example.com', '0904567890',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK',
 'Vũ Thị Ngà', '1993-11-18', 'FEMALE',
 TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()),

(6, 'staff@example.com', '0905678901',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK',
 'Đoàn Văn Dũng', '1992-08-05', 'MALE',
 TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW()),

(7, 'manager@example.com', '0906789012',
 '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzmAMp7DQZ1g6QCQK',
 'Hoàng Thị Hồng', '1988-12-20', 'FEMALE',
 TRUE, TRUE, TRUE, '1.0', NOW(), TRUE, '1.0', NOW(), NOW(), NOW());

-- =================================================================
-- 3. INSERT USER_ROLES (phân quyền)
-- =================================================================

ALTER TABLE user_roles AUTO_INCREMENT = 1;

INSERT INTO user_roles (user_role_id, user_id, role_id, assigned_at, assigned_by) VALUES
(1, 1, 4, NOW(), NULL), -- Admin có SYSTEM_ADMIN role
(2, 2, 1, NOW(), NULL), -- Customer1 là CUSTOMER
(3, 3, 1, NOW(), NULL), -- Customer2 là CUSTOMER
(4, 4, 1, NOW(), NULL), -- Customer3 là CUSTOMER
(5, 5, 1, NOW(), NULL), -- Customer4 là CUSTOMER
(6, 6, 2, NOW(), 1),    -- Staff là CINEMA_STAFF
(7, 7, 3, NOW(), 1);    -- Manager là CINEMA_MANAGER

-- =================================================================
-- 4. INSERT MEMBERSHIP TIERS (hạng thành viên)
-- =================================================================

ALTER TABLE membership_tiers AUTO_INCREMENT = 1;

INSERT INTO membership_tiers (
    tier_id, tier_name, tier_name_display, min_annual_spending, min_visits_per_year,
    points_earn_rate, discount_percentage, free_tickets_per_year, priority_booking,
    free_upgrades, tier_level, is_active, birthday_gift_description, created_at, updated_at
) VALUES
(1, 'BRONZE', 'Thành viên Đồng', 0, 0, 1.0, 0, 0, FALSE, FALSE, 1, TRUE,
 'Combo bắp nước sinh nhật', NOW(), NOW()),

(2, 'SILVER', 'Thành viên Bạc', 2000000, 12, 1.2, 5, 1, TRUE, FALSE, 2, TRUE,
 'Combo bắp nước + 1 vé 2D', NOW(), NOW()),

(3, 'GOLD', 'Thành viên Vàng', 5000000, 24, 1.5, 10, 2, TRUE, TRUE, 3, TRUE,
 'Combo bắp nước + 2 vé 2D/3D', NOW(), NOW()),

(4, 'PLATINUM', 'Thành viên Bạch Kim', 10000000, 36, 2.0, 15, 4, TRUE, TRUE, 4, TRUE,
 'Combo bắp nước + 3 vé mọi định dạng', NOW(), NOW());

-- =================================================================
-- 5. INSERT CINEMA_CHAINS (cụm rạp)
-- =================================================================

ALTER TABLE cinema_chains AUTO_INCREMENT = 1;

INSERT INTO cinema_chains (chain_id, chain_name, logo_url, website, description, is_active, created_at, updated_at) VALUES
(1, 'CGV Cinemas Vietnam', 'https://example.com/cgv-logo.png', 'https://cgv.vn', 
 'Chuỗi rạp chiếu phim hiện đại của Hàn Quốc', TRUE, NOW(), NOW()),

(2, 'Galaxy Cinema', 'https://example.com/galaxy-logo.png', 'https://galaxycine.vn',
 'Chuỗi rạp chiếu phim cao cấp Việt Nam', TRUE, NOW(), NOW()),

(3, 'Lotte Cinema', 'https://example.com/lotte-logo.png', 'https://lottecine.com',
 'Chuỗi rạp chiếu phim Lotte tại các trung tâm thương mại', TRUE, NOW(), NOW());

-- =================================================================
-- 6. INSERT CINEMAS (rạp chiếu phim)
-- =================================================================

ALTER TABLE cinemas AUTO_INCREMENT = 1;

INSERT INTO cinemas (
    cinema_id, chain_id, cinema_name, address, city, district, phone_number, email,
    tax_code, legal_name, latitude, longitude, facilities, is_active, created_at, updated_at
) VALUES
(1, 1, 'CGV Hà Nội - Tòa nhà ShinHo', 
 '191 Tây Sơn, Phường Chính Kinh, Quận Đống Đa', 'Hà Nội', 'Đống Đa', '0243 9999 999', 'hanoi@cgv.vn',
 '0123456789', 'CGV VIETNAM CO., LTD', 21.0176, 105.8214,
 '{"parking": true, "food_court": true, "vip_lounge": true}', TRUE, NOW(), NOW()),

(2, 1, 'CGV TP. Hồ Chí Minh - Landmark 81',
 '481A Nguyễn Hữu Cảnh, Phường Tân Cảng, Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'Bình Thạnh', '0283 9999 999', 'hcm@cgv.vn',
 '0123456790', 'CGV VIETNAM CO., LTD', 10.8039, 106.7186,
 '{"parking": true, "food_court": true, "vip_lounge": true}', TRUE, NOW(), NOW()),

(3, 2, 'Galaxy Cinema - Hà Nội',
 '109 Nguyễn Tuân, Phường Thanh Xuân Bắc, Quận Thanh Xuân', 'Hà Nội', 'Thanh Xuân', '0243 6666 666', 'hanoi@galaxy.vn',
 '0987654321', 'GALAXY CINEMA VIETNAM JSC', 21.0100, 105.8450,
 '{"parking": true, "food_court": false, "vip_lounge": false}', TRUE, NOW(), NOW()),

(4, 2, 'Galaxy Cinema - TP. Hồ Chí Minh',
 '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', '0283 6666 666', 'hcm@galaxy.vn',
 '0987654322', 'GALAXY CINEMA VIETNAM JSC', 10.7750, 106.6970,
 '{"parking": false, "food_court": true, "vip_lounge": false}', TRUE, NOW(), NOW()),

(5, 3, 'Lotte Cinema - Hà Nội',
 'Tầng 7-8, Tòa Lotte Center Hà Nội, 54 Liễu Giai, Quận Ba Đình', 'Hà Nội', 'Ba Đình', '0243 7777 777', 'hanoi@lotte.vn',
 '0456789123', 'LOTTE CINEMA VIETNAM CO., LTD', 21.0358, 105.8070,
 '{"parking": true, "food_court": true, "vip_lounge": true}', TRUE, NOW(), NOW());

-- =================================================================
-- 7. INSERT CINEMA_HALLS (phòng chiếu)
-- =================================================================

ALTER TABLE cinema_halls AUTO_INCREMENT = 1;

INSERT INTO cinema_halls (
    hall_id, cinema_id, hall_name, hall_type, total_seats, rows_count, seats_per_row,
    screen_type, sound_system, is_active, created_at, updated_at
) VALUES
-- CGV Hà Nội - Tòa nhà ShinHo
(1, 1, 'CGV ShinHo - Hall 1', '2D', 100, 10, 10, 'Standard', 'Dolby Digital', TRUE, NOW(), NOW()),
(2, 1, 'CGV ShinHo - Hall 2', '3D', 120, 12, 10, 'Standard', 'Dolby Atmos', TRUE, NOW(), NOW()),
(3, 1, 'CGV ShinHo - Hall 3', 'IMAX', 80, 8, 10, 'IMAX Screen', 'Dolby Atmos', TRUE, NOW(), NOW()),

-- CGV TP. Hồ Chí Minh - Landmark 81
(4, 2, 'CGV Landmark 81 - Hall 1', '2D', 150, 15, 10, 'Standard', 'Dolby Digital', TRUE, NOW(), NOW()),
(5, 2, 'CGV Landmark 81 - Hall 2', '4DX', 100, 10, 10, 'Premium', 'Dolby Atmos', TRUE, NOW(), NOW()),

-- Galaxy Cinema - Hà Nội
(6, 3, 'Galaxy Hà Nội - Hall 1', '2D', 90, 9, 10, 'Standard', 'Dolby Digital', TRUE, NOW(), NOW()),
(7, 3, 'Galaxy Hà Nội - Hall 2', '3D', 80, 8, 10, 'Standard', 'Dolby Atmos', TRUE, NOW(), NOW()),

-- Galaxy Cinema - TP. Hồ Chí Minh
(8, 4, 'Galaxy HCMC - Hall 1', '2D', 100, 10, 10, 'Standard', 'Dolby Digital', TRUE, NOW(), NOW()),

-- Lotte Cinema - Hà Nội
(9, 5, 'Lotte Hà Nội - Hall 1', '2D', 110, 11, 10, 'Standard', 'Dolby Atmos', TRUE, NOW(), NOW()),
(10, 5, 'Lotte Hà Nội - Hall 2', '3D', 90, 9, 10, 'Standard', 'Dolby Atmos', TRUE, NOW(), NOW());

-- =================================================================
-- 8. INSERT SEATS (ghế ngồi) - Sample cho Hall 1, Cinema 1 (10x10 = 100 ghế)
-- =================================================================

ALTER TABLE seats AUTO_INCREMENT = 1;

-- CGV ShinHo - Hall 1 (10 rows x 10 seats)
INSERT INTO seats (seat_id, hall_id, seat_row, seat_number, seat_type, position_x, position_y, is_active) 
SELECT 
    ROW_NUMBER() OVER () as seat_id,
    1 as hall_id,
    CHAR(64 + row_num) as seat_row,
    seat_num as seat_number,
    CASE 
        WHEN row_num <= 2 THEN 'STANDARD'
        WHEN row_num <= 8 THEN 'STANDARD'
        WHEN row_num = 9 AND seat_num BETWEEN 4 AND 7 THEN 'COUPLE'
        WHEN row_num = 10 THEN 'VIP'
        ELSE 'STANDARD'
    END as seat_type,
    seat_num as position_x,
    row_num as position_y,
    TRUE as is_active
FROM (
    SELECT row_num, seat_num
    FROM (SELECT 1 as row_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
          UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) rows
    CROSS JOIN (SELECT 1 as seat_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) seats
) AS data
LIMIT 100;

-- =================================================================
-- 9. INSERT MOVIE_GENRES (thể loại phim)
-- =================================================================

ALTER TABLE movie_genres AUTO_INCREMENT = 1;

INSERT INTO movie_genres (genre_id, genre_name, genre_name_en, description, is_active) VALUES
(1, 'Hành động', 'Action', 'Phim hành động với các cảnh quay tuyệt vời', TRUE),
(2, 'Hài hước', 'Comedy', 'Phim hài hước để cười vui vẻ', TRUE),
(3, 'Chính kịch', 'Drama', 'Phim chính kịch cảm động', TRUE),
(4, 'Kinh dị', 'Horror', 'Phim kinh dị rợn người', TRUE),
(5, 'Khoa học viễn tưởng', 'Sci-Fi', 'Phim khoa học viễn tưởng tưởng tượng', TRUE),
(6, 'Tình yêu', 'Romance', 'Phim tình cảm lãng mạn', TRUE),
(7, 'Hoạt hình', 'Animation', 'Phim hoạt hình cho gia đình', TRUE),
(8, 'Phiêu lưu', 'Adventure', 'Phim phiêu lưu mạo hiểm', TRUE);

-- =================================================================
-- 10. INSERT MOVIES (phim)
-- =================================================================

ALTER TABLE movies AUTO_INCREMENT = 1;

INSERT INTO movies (
    movie_id, title, title_en, age_rating, synopsis, duration_minutes,
    release_date, end_date, country, language, subtitle_language, director, cast,
    poster_url, trailer_url, status, imdb_rating, created_at, updated_at
) VALUES
(1, 'Người Nhện: Vũ Trụ Nhện', 'Spider-Man: Across the Spider-Verse', 'T13',
 'Tên của tôi là Miles Morales. Tôi là người Nhện đen lập phương. Nhưng không, ý của bạn là có bao nhiêu người Nhện ở đó?',
 140, '2025-10-01', '2025-10-31', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Joaquim Dos Santos', 'Shameik Moore, Hailee Steinfeld',
 'https://example.com/spider-man.jpg', 'https://youtube.com/spider-man', 'NOW_SHOWING', 8.5, NOW(), NOW()),

(2, 'Oppenheimer', 'Oppenheimer', 'T16',
 'Câu chuyện về người đàn ông được gọi là bố của bom nguyên tử',
 180, '2025-09-15', '2025-10-15', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Christopher Nolan', 'Cillian Murphy, Robert Downey Jr.',
 'https://example.com/oppenheimer.jpg', 'https://youtube.com/oppenheimer', 'NOW_SHOWING', 8.8, NOW(), NOW()),

(3, 'Nhiệm Vụ Bất Khả Thi 8', 'Mission Impossible: Dead Reckoning Part 2', 'T13',
 'Ethan Hunt và đội IMF phải đối mặt với một kẻ thù mới',
 160, '2025-11-01', '2025-11-30', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Christopher McQuarrie', 'Tom Cruise, Rebecca Ferguson',
 'https://example.com/mission-impossible.jpg', 'https://youtube.com/mission-impossible', 'COMING_SOON', 8.0, NOW(), NOW()),

(4, 'Bố Già', 'The Godfather', 'T18',
 'Câu chuyện về gia đình Mafia quyền lực nhất',
 175, '2025-10-10', '2025-11-10', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Francis Ford Coppola', 'Marlon Brando, Al Pacino',
 'https://example.com/godfather.jpg', 'https://youtube.com/godfather', 'NOW_SHOWING', 9.2, NOW(), NOW()),

(5, 'Vịn Từ Đông', 'Eastern Wind', 'P',
 'Câu chuyện ấu thơ về bốn người bạn',
 95, '2025-10-05', '2025-10-25', 'Việt Nam', 'Tiếng Việt', 'Tiếng Việt',
 'Trấn Thành', 'Trấn Thành, Anitta',
 'https://example.com/eastern-wind.jpg', 'https://youtube.com/eastern-wind', 'NOW_SHOWING', 7.2, NOW(), NOW()),

(6, 'Dungeons & Dragons: Danh Dự của Kẻ Trộm', 'Dungeons & Dragons: Honor Among Thieves', 'T13',
 'Một nhóm những kẻ trộm khéo léo sắp diễn ra một vụ trộm lớn',
 134, '2025-09-01', '2025-10-01', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Jonathan Goldstein', 'Chris Pine, Michelle Rodriguez',
 'https://example.com/dnd.jpg', 'https://youtube.com/dnd', 'END_SHOWING', 7.0, NOW(), NOW()),

(7, 'Chinh Phục Giấc Mơ', 'Dream Big', 'P',
 'Phim hoạt hình về một cậu bé nông thôn có giấc mơ lớn',
 85, '2025-10-20', '2025-11-20', 'Việt Nam', 'Tiếng Việt', 'Tiếng Việt',
 'Quỳnh Anh Shyn', 'Hoạt hình',
 'https://example.com/dream-big.jpg', 'https://youtube.com/dream-big', 'COMING_SOON', 7.8, NOW(), NOW()),

(8, 'The Nun II', 'The Nun II', 'T16',
 'Sau những sự kiện kinh hoàng, nữ tu phải quay trở lại',
 110, '2025-10-08', '2025-11-08', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt',
 'Michael Chaves', 'Taissa Farmiga, Jonas Bloquet',
 'https://example.com/nun2.jpg', 'https://youtube.com/nun2', 'NOW_SHOWING', 6.5, NOW(), NOW());

-- =================================================================
-- 11. INSERT MOVIE_GENRE_MAPPING (ánh xạ phim-thể loại)
-- =================================================================

INSERT INTO movie_genre_mapping (movie_id, genre_id) VALUES
-- Spider-Man (Hành động, Khoa học viễn tưởng, Phiêu lưu)
(1, 1), (1, 5), (1, 8),
-- Oppenheimer (Chính kịch, Hành động)
(2, 3), (2, 1),
-- Mission Impossible (Hành động, Phiêu lưu)
(3, 1), (3, 8),
-- The Godfather (Chính kịch, Hành động)
(4, 3), (4, 1),
-- Eastern Wind (Hài hước, Chính kịch)
(5, 2), (5, 3),
-- Dungeons & Dragons (Phiêu lưu, Hành động, Hài hước)
(6, 8), (6, 1), (6, 2),
-- Dream Big (Hoạt hình, Chính kịch)
(7, 7), (7, 3),
-- The Nun II (Kinh dí)
(8, 4);

-- =================================================================
-- 12. INSERT MEMBERSHIPS (thành viên)
-- =================================================================

ALTER TABLE memberships AUTO_INCREMENT = 1;

INSERT INTO memberships (
    membership_id, user_id, membership_number, tier_id, total_points, available_points,
    lifetime_spending, annual_spending, total_visits, tier_start_date, next_tier_review_date,
    status, created_at, updated_at
) VALUES
(1, 2, 'MB000000001', 3, 850, 850, 25000000, 6000000, 18, '2023-01-01', '2026-01-01', 'ACTIVE', NOW(), NOW()),
(2, 3, 'MB000000002', 1, 120, 120, 500000, 200000, 3, '2024-06-01', '2025-06-01', 'ACTIVE', NOW(), NOW()),
(3, 4, 'MB000000003', 2, 450, 350, 5000000, 2500000, 12, '2023-11-01', '2025-11-01', 'ACTIVE', NOW(), NOW()),
(4, 5, 'MB000000004', 1, 200, 180, 1000000, 800000, 5, '2024-01-15', '2025-01-15', 'ACTIVE', NOW(), NOW());

-- =================================================================
-- 13. INSERT SHOWTIMES (suất chiếu)
-- =================================================================

ALTER TABLE showtimes AUTO_INCREMENT = 1;

INSERT INTO showtimes (
    showtime_id, movie_id, hall_id, show_date, start_time, end_time, format_type,
    subtitle_language, status, available_seats, base_price, created_at, updated_at
) VALUES
-- Spider-Man showtimes (Cinema 1 - CGV ShinHo)
(1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30', '11:50', '2D', 'Tiếng Việt', 'SELLING', 85, 100000, NOW(), NOW()),
(2, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00', '15:20', '2D', 'Tiếng Việt', 'SELLING', 45, 100000, NOW(), NOW()),
(3, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00', '19:20', '2D', 'Tiếng Việt', 'SELLING', 25, 100000, NOW(), NOW()),
(4, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00', '22:20', '2D', 'Tiếng Việt', 'SELLING', 10, 120000, NOW(), NOW()),

(5, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00', '11:20', '3D', 'Tiếng Việt', 'SELLING', 90, 130000, NOW(), NOW()),
(6, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00', '16:20', '3D', 'Tiếng Việt', 'SELLING', 60, 130000, NOW(), NOW()),

(7, 1, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00', '13:20', 'IMAX', 'Tiếng Việt', 'SELLING', 50, 180000, NOW(), NOW()),
(8, 1, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00', '20:20', 'IMAX', 'Tiếng Việt', 'SELLING', 15, 180000, NOW(), NOW()),

-- Oppenheimer showtimes
(9, 2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:30', '17:30', '2D', 'Tiếng Việt', 'SELLING', 70, 100000, NOW(), NOW()),
(10, 2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:30', '22:30', '2D', 'Tiếng Việt', 'SELLING', 20, 120000, NOW(), NOW()),

(11, 2, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00', '18:00', '3D', 'Tiếng Việt', 'SELLING', 80, 130000, NOW(), NOW()),

-- Eastern Wind showtimes (Cinema 2 - CGV Landmark 81)
(12, 5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00', '11:35', '2D', 'Tiếng Việt', 'SELLING', 120, 80000, NOW(), NOW()),
(13, 5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00', '15:35', '2D', 'Tiếng Việt', 'SELLING', 90, 80000, NOW(), NOW()),
(14, 5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00', '18:35', '2D', 'Tiếng Việt', 'SELLING', 60, 80000, NOW(), NOW()),
(15, 5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00', '21:35', '2D', 'Tiếng Việt', 'SELLING', 40, 100000, NOW(), NOW()),

-- The Godfather showtimes
(16, 4, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00', '15:55', '4DX', 'Tiếng Việt', 'SELLING', 70, 150000, NOW(), NOW()),
(17, 4, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00', '20:55', '4DX', 'Tiếng Việt', 'SELLING', 30, 150000, NOW(), NOW());

-- =================================================================
-- 14. INSERT PRICING_RULES (luật tính giá)
-- =================================================================

ALTER TABLE pricing_rules AUTO_INCREMENT = 1;

INSERT INTO pricing_rules (
    rule_id, rule_name, description, rule_type, amount, percentage,
    valid_from, valid_to, applies_to, priority, is_active, created_at, updated_at
) VALUES
(1, 'Giảm giá thứ hai - thứ năm', 'Giảm 20% cho ngày thường', 'DISCOUNT', NULL, 20.00,
 '2025-01-01', '2025-12-31', '{"day_of_week": ["MON", "TUE", "WED", "THU", "FRI"]}', 1, TRUE, NOW(), NOW()),

(2, 'Phụ thu định dạng IMAX', 'Phụ thu 50% cho định dạng IMAX', 'SURCHARGE', NULL, 50.00,
 '2025-01-01', '2025-12-31', '{"format": ["IMAX"]}', 2, TRUE, NOW(), NOW()),

(3, 'Phụ thu giờ vàng', 'Phụ thu 30% cho suất 20:00-22:00', 'SURCHARGE', NULL, 30.00,
 '2025-01-01', '2025-12-31', '{"time_range": ["20:00", "22:00"]}', 3, TRUE, NOW(), NOW()),

(4, 'Giảm giá ghế VIP khi mua combo', 'Giảm 15% cho ghế VIP', 'DISCOUNT', NULL, 15.00,
 '2025-01-01', '2025-12-31', '{"seat_types": ["VIP", "COUPLE"]}', 0, TRUE, NOW(), NOW());

-- =================================================================
-- 15. INSERT CONCESSION_CATEGORIES (danh mục bắp nước)
-- =================================================================

ALTER TABLE concession_categories AUTO_INCREMENT = 1;

INSERT INTO concession_categories (
    category_id, category_name, description, display_order, is_active, created_at, updated_at
) VALUES
(1, 'Combo bắp nước', 'Các combo bắp rang bơ kèm nước', 1, TRUE, NOW(), NOW()),
(2, 'Đồ uống', 'Nước ngọt, nước ép, trà sữa', 2, TRUE, NOW(), NOW()),
(3, 'Snacks & Kẹo', 'Các loại snack và kẹo', 3, TRUE, NOW(), NOW()),
(4, 'Thức ăn nhanh', 'Hotdog, bánh mì, nachos', 4, TRUE, NOW(), NOW());

-- =================================================================
-- 16. INSERT CONCESSION_ITEMS (sản phẩm bắp nước)
-- =================================================================

ALTER TABLE concession_items AUTO_INCREMENT = 1;

INSERT INTO concession_items (
    item_id, category_id, item_name, description, image_url, price, cost_price,
    size, calories, stock_quantity, low_stock_threshold, is_combo, is_available,
    display_order, created_at, updated_at
) VALUES
-- Combo bắp nước
(1, 1, 'Combo nhỏ', 'Bắp rang bơ + Nước ngọt (350ml)', 'https://example.com/combo-s.jpg',
 89000, 25000, 'SMALL', 450, 100, 10, FALSE, TRUE, 1, NOW(), NOW()),

(2, 1, 'Combo vừa', 'Bắp rang bơ + Nước ngọt (500ml)', 'https://example.com/combo-m.jpg',
 129000, 38000, 'MEDIUM', 650, 150, 15, FALSE, TRUE, 2, NOW(), NOW()),

(3, 1, 'Combo lớn', 'Bắp rang bơ + Nước ngọt (700ml) + Kẹo', 'https://example.com/combo-l.jpg',
 179000, 52000, 'LARGE', 950, 80, 10, FALSE, TRUE, 3, NOW(), NOW()),

-- Đồ uống
(4, 2, 'Coca Cola', 'Nước ngọt Coca Cola', 'https://example.com/coke.jpg',
 35000, 10000, 'MEDIUM', 140, 200, 30, FALSE, TRUE, 1, NOW(), NOW()),

(5, 2, 'Pepsi', 'Nước ngọt Pepsi', 'https://example.com/pepsi.jpg',
 35000, 10000, 'MEDIUM', 140, 180, 30, FALSE, TRUE, 2, NOW(), NOW()),

(6, 2, 'Nước cam tươi', 'Nước cam ép tươi', 'https://example.com/orange-juice.jpg',
 45000, 15000, 'MEDIUM', 120, 100, 15, FALSE, TRUE, 3, NOW(), NOW()),

(7, 2, 'Trà sữa Oolong', 'Trà sữa Oolong nóng', 'https://example.com/milk-tea.jpg',
 55000, 18000, 'MEDIUM', 200, 120, 20, FALSE, TRUE, 4, NOW(), NOW()),

-- Snacks
(8, 3, 'Kẹo bỏng ngô', 'Kẹo bỏng ngô đậu phộng', 'https://example.com/candy.jpg',
 25000, 8000, 'MEDIUM', 220, 150, 20, FALSE, TRUE, 1, NOW(), NOW()),

(9, 3, 'Khoai tây chiên', 'Khoai tây chiên giòn', 'https://example.com/chips.jpg',
 45000, 14000, 'MEDIUM', 310, 100, 15, FALSE, TRUE, 2, NOW(), NOW()),

-- Thức ăn
(10, 4, 'Hot Dog', 'Hot Dog phô mai', 'https://example.com/hotdog.jpg',
 65000, 20000, 'MEDIUM', 450, 80, 10, FALSE, TRUE, 1, NOW(), NOW()),

(11, 4, 'Bánh mì kẹp', 'Bánh mì kẹp thịt', 'https://example.com/sandwich.jpg',
 75000, 25000, 'MEDIUM', 520, 70, 10, FALSE, TRUE, 2, NOW(), NOW());

-- =================================================================
-- 17. INSERT BOOKINGS (đơn đặt vé)
-- =================================================================

ALTER TABLE bookings AUTO_INCREMENT = 1;

INSERT INTO bookings (
    booking_id, booking_code, user_id, showtime_id, booking_date, total_seats,
    subtotal, discount_amount, tax_amount, service_fee, total_amount, status,
    payment_method, payment_status, paid_at, hold_expires_at, qr_code,
    invoice_number, invoice_issued_at, created_at, updated_at
) VALUES
(1, 'BK000000001', 2, 1, NOW(), 2, 200000, 0, 12000, 6000, 218000, 'PAID',
 'CREDIT_CARD', 'COMPLETED', NOW(), NULL, 'QR000000001', 'INV000000001', NOW(), NOW(), NOW()),

(2, 'BK000000002', 3, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 3, 300000, 30000, 16200, 9000, 295200, 'PAID',
 'E_WALLET', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 'QR000000002', 'INV000000002', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),

(3, 'BK000000003', 4, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 130000, 0, 7800, 3900, 141700, 'PAID',
 'DEBIT_CARD', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 'QR000000003', 'INV000000003', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW()),

(4, 'BK000000004', 5, 9, DATE_SUB(NOW(), INTERVAL 3 DAY), 4, 400000, 20000, 22800, 12000, 414800, 'PAID',
 'BANK_TRANSFER', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 'QR000000004', 'INV000000004', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), NOW()),

(5, 'BK000000005', 2, 12, NOW(), 2, 160000, 0, 9600, 4800, 174400, 'CONFIRMED',
 'CREDIT_CARD', 'PENDING', NULL, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'QR000000005', NULL, NULL, NOW(), NOW());

-- =================================================================
-- 18. INSERT TICKETS (vé)
-- =================================================================

ALTER TABLE tickets AUTO_INCREMENT = 1;

INSERT INTO tickets (
    ticket_id, booking_id, seat_id, ticket_code, base_price, surcharge_amount,
    discount_amount, final_price, status, checked_in_at, qr_code, created_at, updated_at
) VALUES
-- Booking 1 (BK000000001) - 2 vé
(1, 1, 1, 'TK000000001', 100000, 0, 0, 100000, 'PAID', NULL, 'TQR000000001', NOW(), NOW()),
(2, 1, 2, 'TK000000002', 100000, 0, 0, 100000, 'PAID', NULL, 'TQR000000002', NOW(), NOW()),

-- Booking 2 (BK000000002) - 3 vé
(3, 2, 3, 'TK000000003', 100000, 0, 10000, 90000, 'PAID', NULL, 'TQR000000003', NOW(), NOW()),
(4, 2, 4, 'TK000000004', 100000, 0, 10000, 90000, 'PAID', NULL, 'TQR000000004', NOW(), NOW()),
(5, 2, 5, 'TK000000005', 100000, 0, 10000, 90000, 'PAID', NULL, 'TQR000000005', NOW(), NOW()),

-- Booking 3 (BK000000003) - 1 vé 3D
(6, 3, 11, 'TK000000006', 130000, 0, 0, 130000, 'PAID', NULL, 'TQR000000006', NOW(), NOW()),

-- Booking 4 (BK000000004) - 4 vé IMAX
(7, 4, 21, 'TK000000007', 180000, 0, 20000, 160000, 'PAID', NULL, 'TQR000000007', NOW(), NOW()),
(8, 4, 22, 'TK000000008', 180000, 0, 20000, 160000, 'PAID', NULL, 'TQR000000008', NOW(), NOW()),
(9, 4, 23, 'TK000000009', 180000, 0, 20000, 160000, 'PAID', NULL, 'TQR000000009', NOW(), NOW()),
(10, 4, 24, 'TK000000010', 180000, 0, 20000, 160000, 'PAID', NULL, 'TQR000000010', NOW(), NOW());

-- =================================================================
-- 19. INSERT CONCESSION_ORDERS (đơn bắp nước)
-- =================================================================

ALTER TABLE concession_orders AUTO_INCREMENT = 1;

INSERT INTO concession_orders (
    concession_order_id, booking_id, user_id, order_number, cinema_id, pickup_time,
    subtotal, tax_amount, discount_amount, total_amount, status, payment_status,
    notes, created_at, updated_at
) VALUES
(1, 1, 2, 'CO000000001', 1, DATE_ADD(NOW(), INTERVAL 30 MINUTE),
 258000, 15480, 0, 273480, 'READY', 'PAID', 'Ghi chú: Xin thêm bơ', NOW(), NOW()),

(2, 2, 3, 'CO000000002', 1, DATE_ADD(NOW(), INTERVAL 45 MINUTE),
 129000, 7740, 0, 136740, 'PREPARING', 'PAID', NULL, NOW(), NOW()),

(3, 4, 5, 'CO000000003', 1, DATE_ADD(NOW(), INTERVAL 15 MINUTE),
 387000, 23220, 0, 410220, 'PENDING', 'PENDING', 'Hủy mặn', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- =================================================================
-- 20. INSERT CONCESSION_ORDER_ITEMS (chi tiết đơn bắp nước)
-- =================================================================

ALTER TABLE concession_order_items AUTO_INCREMENT = 1;

INSERT INTO concession_order_items (
    order_item_id, concession_order_id, item_id, quantity, unit_price, total_price,
    customization_notes, created_at
) VALUES
-- Order 1
(1, 1, 2, 1, 129000, 129000, NULL, NOW()),
(2, 1, 4, 2, 35000, 70000, NULL, NOW()),
(3, 1, 8, 1, 25000, 25000, NULL, NOW()),
(4, 1, 9, 1, 45000, 45000, NULL, NOW()),

-- Order 2
(5, 2, 2, 1, 129000, 129000, NULL, NOW()),

-- Order 3
(6, 3, 3, 2, 179000, 358000, NULL, NOW()),
(7, 3, 10, 1, 65000, 65000, NULL, NOW()),
(8, 3, 11, 1, 75000, 75000, 'Thêm dưa chua', NOW());

-- =================================================================
-- 21. INSERT PROMOTIONS (chương trình khuyến mãi)
-- =================================================================

ALTER TABLE promotions AUTO_INCREMENT = 1;

INSERT INTO promotions (
    promotion_id, promotion_code, promotion_name, description, promotion_type,
    discount_percentage, min_purchase_amount, max_usage_total, max_usage_per_user,
    start_date, end_date, is_active, created_by, created_at, updated_at
) VALUES
(1, 'SUMMER50', 'Giảm 50% mua 2 vé được 1 vé miễn phí', 'Khuyến mãi mùa hè',
 'PERCENTAGE', 50.00, 0, 1000, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE, 1, NOW(), NOW()),

(2, 'NEWMEMBER20', 'Thành viên mới giảm 20%', 'Chào mừng thành viên mới',
 'PERCENTAGE', 20.00, 100000, 100, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 1, NOW(), NOW()),

(3, 'VIP100K', 'Thành viên VIP được giảm 100K', 'Ưu đãi cho thành viên VIP',
 'FIXED_AMOUNT', NULL, 500000, 500, 2, NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), TRUE, 1, NOW(), NOW());

-- =================================================================
-- 22. INSERT PAYMENTS (thanh toán)
-- =================================================================

ALTER TABLE payments AUTO_INCREMENT = 1;

INSERT INTO payments (
    payment_id, booking_id, payment_reference, payment_method, payment_provider,
    amount, currency, status, gateway_transaction_id, initiated_at, completed_at,
    created_at, updated_at
) VALUES
(1, 1, 'PAY000000001', 'CREDIT_CARD', 'VNPAY', 218000, 'VND', 'COMPLETED',
 'VNPAY_TXN_000000001', NOW(), NOW(), NOW(), NOW()),

(2, 2, 'PAY000000002', 'E_WALLET', 'MOMO', 295200, 'VND', 'COMPLETED',
 'MOMO_TXN_000000002', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),

(3, 3, 'PAY000000003', 'DEBIT_CARD', 'VNPAY', 141700, 'VND', 'COMPLETED',
 'VNPAY_TXN_000000003', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW()),

(4, 4, 'PAY000000004', 'BANK_TRANSFER', 'BANK', 414800, 'VND', 'COMPLETED',
 'BANK_TXN_000000004', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), NOW());

-- =================================================================
-- 23. INSERT POINTS_TRANSACTIONS (giao dịch điểm)
-- =================================================================

ALTER TABLE points_transactions AUTO_INCREMENT = 1;

INSERT INTO points_transactions (
    transaction_id, user_id, transaction_type, points_amount, source_type, source_id,
    description, balance_before, balance_after, expires_at, created_by, created_at
) VALUES
(1, 2, 'EARN', 180, 'BOOKING', 1,
 'Tích điểm từ booking BK000000001', 670, 850, DATE_ADD(CURDATE(), INTERVAL 365 DAY), NULL, NOW()),

(2, 3, 'EARN', 260, 'BOOKING', 2,
 'Tích điểm từ booking BK000000002', 0, 260, DATE_ADD(CURDATE(), INTERVAL 365 DAY), NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

(3, 4, 'EARN', 105, 'BOOKING', 3,
 'Tích điểm từ booking BK000000003', 345, 450, DATE_ADD(CURDATE(), INTERVAL 365 DAY), NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),

(4, 5, 'EARN', 330, 'BOOKING', 4,
 'Tích điểm từ booking BK000000004', 0, 330, DATE_ADD(CURDATE(), INTERVAL 365 DAY), NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),

(5, 2, 'REDEEM', -100, 'PROMOTION', 1,
 'Sử dụng 100 điểm cho khuyến mãi', 850, 750, NULL, NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),

(6, 2, 'GIFT', 50, 'BONUS', NULL,
 'Tặng sinh nhật', 750, 800, DATE_ADD(CURDATE(), INTERVAL 365 DAY), 1, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =================================================================
-- 24. INSERT USER_VOUCHERS (voucher người dùng)
-- =================================================================

ALTER TABLE user_vouchers AUTO_INCREMENT = 1;

INSERT INTO user_vouchers (
    voucher_id, user_id, promotion_id, voucher_code, status,
    issued_at, expires_at, booking_id, created_at
) VALUES
(1, 2, 2, 'VOUCHER_KH_000000001', 'USED',
 DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, NOW()),

(2, 3, 2, 'VOUCHER_KH_000000002', 'AVAILABLE',
 DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), NULL, NOW()),

(3, 4, 3, 'VOUCHER_KH_000000003', 'AVAILABLE',
 DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 175 DAY), NULL, NOW()),

(4, 5, 1, 'VOUCHER_KH_000000004', 'EXPIRED',
 DATE_SUB(NOW(), INTERVAL 120 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, NOW());

-- =================================================================
-- 25. INSERT REFUNDS (hoàn tiền)
-- =================================================================

ALTER TABLE refunds AUTO_INCREMENT = 1;

INSERT INTO refunds (
    refund_id, payment_id, refund_reference, refund_amount, refund_method,
    reason, reason_description, status, processed_by, processed_at,
    created_at, updated_at
) VALUES
-- No refunds yet, but structure is ready

-- =================================================================
-- 26. INSERT SYSTEM_CONFIGURATIONS (cấu hình hệ thống)
-- =================================================================

ALTER TABLE system_configurations AUTO_INCREMENT = 1;

INSERT INTO system_configurations (
    config_id, config_key, config_value, data_type, description, category,
    created_by, updated_by, created_at, updated_at
) VALUES
(1, 'SEAT_HOLD_DURATION_MINUTES', '15', 'INTEGER', 'Thời gian giữ ghế khi đặt vé', 'BOOKING', 1, 1, NOW(), NOW()),
(2, 'MAX_TICKETS_PER_BOOKING', '10', 'INTEGER', 'Số lượng vé tối đa trong một lần đặt', 'BOOKING', 1, 1, NOW(), NOW()),
(3, 'BOOKING_CANCEL_DEADLINE_MINUTES', '120', 'INTEGER', 'Thời gian tối thiểu trước giờ chiếu để hủy', 'BOOKING', 1, 1, NOW(), NOW()),
(4, 'POINTS_TO_VND_RATE', '1000', 'DECIMAL', '1 điểm = bao nhiêu VND', 'POINTS', 1, 1, NOW(), NOW()),
(5, 'DEFAULT_SERVICE_FEE_PERCENTAGE', '3.0', 'DECIMAL', 'Phí dịch vụ mặc định (%)', 'PAYMENT', 1, 1, NOW(), NOW()),
(6, 'MAX_REFUND_REQUESTS_PER_MONTH', '3', 'INTEGER', 'Số lần hủy vé tối đa mỗi tháng', 'REFUND', 1, 1, NOW(), NOW());

-- =================================================================
-- 27. VERIFICATION QUERIES (kiểm tra dữ liệu)
-- =================================================================

-- Kiểm tra tổng số bản ghi
SELECT 'Tổng số bản ghi' AS 'Loại dữ liệu'
UNION ALL
SELECT CONCAT('Users: ', COUNT(*)) FROM users
UNION ALL
SELECT CONCAT('Roles: ', COUNT(*)) FROM roles
UNION ALL
SELECT CONCAT('User Roles: ', COUNT(*)) FROM user_roles
UNION ALL
SELECT CONCAT('Memberships: ', COUNT(*)) FROM memberships
UNION ALL
SELECT CONCAT('Showtimes: ', COUNT(*)) FROM showtimes
UNION ALL
SELECT CONCAT('Bookings: ', COUNT(*)) FROM bookings
UNION ALL
SELECT CONCAT('Tickets: ', COUNT(*)) FROM tickets
UNION ALL
SELECT CONCAT('Concession Orders: ', COUNT(*)) FROM concession_orders;

-- Thông tin người dùng và thành viên
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    u.phone_number,
    m.membership_number,
    mt.tier_name,
    m.total_points,
    m.available_points,
    m.status as membership_status
FROM users u
LEFT JOIN memberships m ON u.user_id = m.user_id
LEFT JOIN membership_tiers mt ON m.tier_id = mt.tier_id
WHERE u.id <= 5
ORDER BY u.user_id;

-- Thông tin đặt vé
SELECT 
    b.booking_code,
    u.full_name,
    m.title as movie_title,
    s.show_date,
    s.start_time,
    COUNT(t.ticket_id) as total_tickets,
    b.total_amount,
    b.status as booking_status,
    b.payment_status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN showtimes s ON b.showtime_id = s.showtime_id
JOIN movies m ON s.movie_id = m.movie_id
LEFT JOIN tickets t ON b.booking_id = t.booking_id
GROUP BY b.booking_id
ORDER BY b.booking_date DESC;

-- Thống kê doanh thu
SELECT 
    DATE(b.booking_date) as booking_date,
    COUNT(DISTINCT b.booking_id) as total_bookings,
    SUM(b.total_seats) as total_tickets,
    SUM(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE 0 END) as total_revenue
FROM bookings b
GROUP BY DATE(b.booking_date)
ORDER BY booking_date DESC;

-- ============================================================================
-- KẾT THÚC SAMPLE DATA
-- ============================================================================

-- Thông báo hoàn thành
SELECT 'Sample data inserted successfully!' AS 'Status';
SELECT NOW() AS 'Inserted at';
