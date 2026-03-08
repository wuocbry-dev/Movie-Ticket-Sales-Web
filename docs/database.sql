-- =================================================================
-- MOVIE TICKET SALES WEB PROJECT - DATABASE SCHEMA
-- =================================================================
-- Thiết kế database tuân thủ pháp luật Việt Nam
-- Hỗ trợ đầy đủ các user stories đã mô tả
-- Phiên bản: 1.0
-- Ngày tạo: 2025-10-13
-- =================================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS movie_ticket_sales 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE movie_ticket_sales;

-- =================================================================
-- 1. BẢNG QUẢN LÝ NGƯỜI DÙNG VÀ AUTHENTICATION
-- =================================================================

-- Bảng vai trò người dùng
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng chính
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    avatar_url VARCHAR(500),
    
    -- Trạng thái tài khoản
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    
    -- Tuân thủ GDPR/PDPA - theo Nghị định 13/2023/NĐ-CP
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    privacy_policy_version VARCHAR(20),
    privacy_policy_accepted_at TIMESTAMP NULL,
    terms_of_service_accepted BOOLEAN DEFAULT FALSE,
    terms_of_service_version VARCHAR(20),
    terms_of_service_accepted_at TIMESTAMP NULL,
    
    -- Marketing preferences
    marketing_email_consent BOOLEAN DEFAULT FALSE,
    marketing_sms_consent BOOLEAN DEFAULT FALSE,
    
    -- Thông tin bảo mật
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Bảng phân quyền người dùng
CREATE TABLE user_roles (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    
    UNIQUE KEY unique_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Bảng session và tokens
CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =================================================================
-- 2. BẢNG QUẢN LÝ RẠP CHIẾU PHIM
-- =================================================================

-- Bảng cụm rạp/thành phố
CREATE TABLE cinema_chains (
    chain_id INT PRIMARY KEY AUTO_INCREMENT,
    chain_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng rạp chiếu phim
CREATE TABLE cinemas (
    cinema_id INT PRIMARY KEY AUTO_INCREMENT,
    chain_id INT,
    cinema_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Thông tin kinh doanh - tuân thủ Nghị định 123/2020/NĐ-CP về hóa đơn điện tử
    tax_code VARCHAR(50), -- Mã số thuế (MST)
    legal_name VARCHAR(255), -- Tên pháp lý của doanh nghiệp
    
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Thông tin vận hành
    opening_hours JSON, -- Lưu giờ mở cửa theo ngày trong tuần
    facilities JSON, -- Các tiện ích (parking, food court, etc.)
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_city (city),
    INDEX idx_chain_id (chain_id),
    FOREIGN KEY (chain_id) REFERENCES cinema_chains(chain_id)
);

-- Bảng phòng chiếu
CREATE TABLE cinema_halls (
    hall_id INT PRIMARY KEY AUTO_INCREMENT,
    cinema_id INT NOT NULL,
    hall_name VARCHAR(100) NOT NULL,
    hall_type ENUM('2D', '3D', 'IMAX', '4DX', 'SCREENX') DEFAULT '2D',
    total_seats INT NOT NULL,
    
    -- Cấu hình sơ đồ ghế
    rows_count INT NOT NULL,
    seats_per_row INT NOT NULL,
    seat_layout JSON, -- Lưu cấu trúc chi tiết sơ đồ ghế
    
    -- Thông tin kỹ thuật
    screen_type VARCHAR(100),
    sound_system VARCHAR(100),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cinema_id (cinema_id),
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE
);

-- Bảng ghế ngồi
CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    hall_id INT NOT NULL,
    seat_row VARCHAR(5) NOT NULL, -- A, B, C...
    seat_number INT NOT NULL, -- 1, 2, 3...
    seat_type ENUM('STANDARD', 'VIP', 'COUPLE', 'WHEELCHAIR') DEFAULT 'STANDARD',
    
    -- Vị trí trong sơ đồ
    position_x INT, -- Tọa độ X trong grid layout
    position_y INT, -- Tọa độ Y trong grid layout
    
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE KEY unique_seat_position (hall_id, seat_row, seat_number),
    INDEX idx_hall_id (hall_id),
    FOREIGN KEY (hall_id) REFERENCES cinema_halls(hall_id) ON DELETE CASCADE
);

-- =================================================================
-- 3. BẢNG QUẢN LÝ PHIM VÀ NỘI DUNG
-- =================================================================

-- Bảng thể loại phim
CREATE TABLE movie_genres (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    genre_name VARCHAR(100) NOT NULL UNIQUE,
    genre_name_en VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Bảng phim
CREATE TABLE movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    
    -- Phân loại phim theo Thông tư 05/2023/TT-BVHTTDL
    age_rating ENUM('P', 'K', 'T13', 'T16', 'T18') NOT NULL,
    content_warning TEXT, -- Cảnh báo nội dung cụ thể
    
    -- Thông tin phim
    synopsis TEXT,
    synopsis_en TEXT,
    duration_minutes INT NOT NULL,
    release_date DATE,
    end_date DATE, -- Ngày kết thúc chiếu
    country VARCHAR(100),
    language VARCHAR(100),
    subtitle_language VARCHAR(100),
    
    -- Đoàn làm phim
    director VARCHAR(255),
    cast TEXT, -- JSON array hoặc string với dấu phẩy
    producer VARCHAR(255),
    
    -- Media content
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    trailer_url VARCHAR(500),
    
    -- Trạng thái
    status ENUM('COMING_SOON', 'NOW_SHOWING', 'END_SHOWING') DEFAULT 'COMING_SOON',
    is_featured BOOLEAN DEFAULT FALSE, -- Phim nổi bật
    
    -- Metadata
    imdb_rating DECIMAL(3,1),
    imdb_id VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_release_date (release_date),
    INDEX idx_age_rating (age_rating)
);

-- Bảng liên kết phim - thể loại
CREATE TABLE movie_genre_mapping (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES movie_genres(genre_id)
);

-- =================================================================
-- 4. BẢNG QUẢN LÝ LỊCH CHIẾU VÀ GIÁ VÉ
-- =================================================================

-- Bảng suất chiếu
CREATE TABLE showtimes (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    hall_id INT NOT NULL,
    
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Thông tin định dạng chiếu
    format_type ENUM('2D', '3D', 'IMAX', '4DX', 'SCREENX') DEFAULT '2D',
    subtitle_language VARCHAR(50),
    
    -- Trạng thái và quản lý
    status ENUM('SCHEDULED', 'SELLING', 'SOLD_OUT', 'CANCELLED') DEFAULT 'SCHEDULED',
    available_seats INT,
    
    -- Giá vé cơ bản (có thể có nhiều rule phức tạp)
    base_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_movie_hall_date (movie_id, hall_id, show_date),
    INDEX idx_show_date (show_date),
    INDEX idx_hall_id (hall_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    FOREIGN KEY (hall_id) REFERENCES cinema_halls(hall_id)
);

-- Bảng rules định giá (Pricing Rules Engine)
CREATE TABLE pricing_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Điều kiện áp dụng (JSON để lưu các rule phức tạp)
    conditions JSON, -- Ví dụ: {"day_of_week": ["MON", "TUE"], "time_range": ["22:00", "23:59"]}
    
    -- Loại rule
    rule_type ENUM('SURCHARGE', 'DISCOUNT', 'FIXED_PRICE') NOT NULL,
    
    -- Giá trị áp dụng
    amount DECIMAL(10,2), -- Số tiền
    percentage DECIMAL(5,2), -- Phần trăm
    
    -- Thời gian hiệu lực
    valid_from DATE NOT NULL,
    valid_to DATE,
    
    -- Áp dụng cho đối tượng nào
    applies_to JSON, -- {"seat_types": ["VIP"], "customer_types": ["U22"]}
    
    priority INT DEFAULT 0, -- Ưu tiên rule nào được áp dụng trước
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_valid_dates (valid_from, valid_to),
    INDEX idx_priority (priority)
);

-- =================================================================
-- 5. BẢNG QUẢN LÝ ĐẶT VÉ VÀ GIAO DỊCH
-- =================================================================

-- Bảng đơn đặt vé (Booking Orders)
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(50) UNIQUE NOT NULL, -- Mã đặt vé duy nhất
    user_id INT,
    
    showtime_id INT NOT NULL,
    
    -- Thông tin khách hàng (cho trường hợp guest checkout)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Thông tin đặt vé
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_seats INT NOT NULL,
    
    -- Tính toán giá
    subtotal DECIMAL(10,2) NOT NULL, -- Tổng tiền vé
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL, -- Tổng cuối cùng
    
    -- Trạng thái booking
    status ENUM('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    
    -- Thông tin thanh toán
    payment_method VARCHAR(50),
    payment_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    payment_reference VARCHAR(255), -- Reference từ payment gateway
    paid_at TIMESTAMP NULL,
    
    -- Thời gian giữ ghế (seat hold)
    hold_expires_at TIMESTAMP,
    
    -- QR Code cho vé điện tử
    qr_code VARCHAR(500),
    
    -- Tuân thủ pháp luật về hóa đơn điện tử
    invoice_number VARCHAR(100), -- Số hóa đơn
    invoice_issued_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booking_code (booking_code),
    INDEX idx_user_id (user_id),
    INDEX idx_showtime_id (showtime_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id)
);

-- Bảng chi tiết vé (Tickets)
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    
    ticket_code VARCHAR(50) UNIQUE NOT NULL, -- Mã vé duy nhất cho từng ghế
    
    -- Thông tin giá vé
    base_price DECIMAL(10,2) NOT NULL,
    surcharge_amount DECIMAL(10,2) DEFAULT 0, -- Phụ thu (VIP, 3D, etc.)
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    
    -- Trạng thái vé
    status ENUM('BOOKED', 'PAID', 'USED', 'CANCELLED', 'REFUNDED') DEFAULT 'BOOKED',
    
    -- Check-in thông tin
    checked_in_at TIMESTAMP NULL,
    checked_in_by INT NULL, -- Nhân viên check-in
    
    -- QR Code riêng cho từng vé
    qr_code VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_booking_seat (booking_id, seat_id),
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_status (status),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
    FOREIGN KEY (checked_in_by) REFERENCES users(user_id)
);

-- =================================================================
-- 6. BẢNG QUẢN LÝ THÀNH VIÊN VÀ ĐIỂM THƯỞNG
-- =================================================================

-- Bảng hạng thành viên
CREATE TABLE membership_tiers (
    tier_id INT PRIMARY KEY AUTO_INCREMENT,
    tier_name VARCHAR(100) NOT NULL UNIQUE,
    tier_name_display VARCHAR(100), -- Tên hiển thị (VIP, VVIP, etc.)
    
    -- Điều kiện để đạt hạng
    min_annual_spending DECIMAL(12,2) DEFAULT 0,
    min_visits_per_year INT DEFAULT 0,
    
    -- Quyền lợi
    points_earn_rate DECIMAL(5,2) DEFAULT 1.00, -- Tỷ lệ tích điểm (1.5 = 1.5 điểm/1000đ)
    birthday_gift_description TEXT,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Quyền lợi đặc biệt
    free_tickets_per_year INT DEFAULT 0,
    priority_booking BOOLEAN DEFAULT FALSE,
    free_upgrades BOOLEAN DEFAULT FALSE,
    
    tier_level INT NOT NULL, -- Thứ tự hạng (1, 2, 3...)
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tier_level (tier_level)
);

-- Bảng thông tin thành viên
CREATE TABLE memberships (
    membership_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    tier_id INT NOT NULL,
    
    -- Thống kê tích lũy
    total_points INT DEFAULT 0,
    available_points INT DEFAULT 0, -- Điểm có thể sử dụng
    lifetime_spending DECIMAL(12,2) DEFAULT 0,
    annual_spending DECIMAL(12,2) DEFAULT 0, -- Reset hàng năm
    total_visits INT DEFAULT 0,
    
    -- Thông tin hạng
    tier_start_date DATE,
    next_tier_review_date DATE,
    
    -- Trạng thái
    status ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED') DEFAULT 'ACTIVE',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_membership_number (membership_number),
    INDEX idx_tier_id (tier_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES membership_tiers(tier_id)
);

-- Bảng lịch sử giao dịch điểm
CREATE TABLE points_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    transaction_type ENUM('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'GIFT') NOT NULL,
    points_amount INT NOT NULL, -- Số điểm (dương = tích, âm = trừ)
    
    -- Nguồn gốc giao dịch
    source_type ENUM('BOOKING', 'BONUS', 'BIRTHDAY', 'REFERRAL', 'PROMOTION', 'MANUAL', 'CONCESSION') NOT NULL,
    source_id INT, -- ID của booking, promotion, etc.
    
    description TEXT,
    
    -- Điểm số trước và sau giao dịch
    balance_before INT NOT NULL,
    balance_after INT NOT NULL,
    
    -- Hạn sử dụng (nếu có)
    expires_at DATE NULL,
    
    -- Thông tin audit
    created_by INT, -- Nhân viên thực hiện (nếu manual)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_source (source_type, source_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =================================================================
-- 7. BẢNG QUẢN LÝ KHUYẾN MÃI VÀ VOUCHER
-- =================================================================

-- Bảng chương trình khuyến mãi
CREATE TABLE promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    
    promotion_code VARCHAR(100) UNIQUE NOT NULL,
    promotion_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Loại khuyến mãi
    promotion_type ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_ITEM', 'POINTS_MULTIPLIER') NOT NULL,
    
    -- Giá trị khuyến mãi
    discount_percentage DECIMAL(5,2), -- Cho PERCENTAGE
    discount_amount DECIMAL(10,2), -- Cho FIXED_AMOUNT
    
    -- Điều kiện áp dụng
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2), -- Giới hạn số tiền giảm tối đa
    
    -- Đối tượng áp dụng
    applicable_to JSON, -- {"movies": [1,2,3], "showtimes": [], "membership_tiers": ["VIP"]}
    
    -- Thời gian hiệu lực
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    
    -- Giới hạn sử dụng
    max_usage_total INT, -- Tổng số lần sử dụng
    max_usage_per_user INT DEFAULT 1, -- Số lần/user
    current_usage INT DEFAULT 0,
    
    -- Targeting
    target_user_segments JSON, -- {"new_users": true, "membership_tiers": ["GOLD", "PLATINUM"]}
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    
    INDEX idx_promotion_code (promotion_code),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng voucher cá nhân
CREATE TABLE user_vouchers (
    voucher_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    
    voucher_code VARCHAR(100) UNIQUE NOT NULL, -- Mã voucher cá nhân
    
    -- Trạng thái
    status ENUM('AVAILABLE', 'USED', 'EXPIRED', 'CANCELLED') DEFAULT 'AVAILABLE',
    
    -- Thời gian
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    
    -- Sử dụng
    booking_id INT NULL, -- Booking nào đã sử dụng voucher này
    
    INDEX idx_user_id (user_id),
    INDEX idx_voucher_code (voucher_code),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- =================================================================
-- 8. BẢNG QUẢN LÝ CONCESSION (BẮP NƯỚC)
-- =================================================================

-- Bảng danh mục sản phẩm concession
CREATE TABLE concession_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng sản phẩm concession
CREATE TABLE concession_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Hình ảnh và media
    image_url VARCHAR(500),
    
    -- Giá và inventory
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2), -- Giá gốc (để tính profit)
    
    -- Thông tin sản phẩm
    size VARCHAR(50), -- Small, Medium, Large
    calories INT, -- Thông tin dinh dưỡng
    ingredients TEXT, -- Thành phần
    
    -- Inventory management
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    
    -- Combo information
    is_combo BOOLEAN DEFAULT FALSE,
    combo_items JSON, -- Nếu là combo, chứa list items con
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    available_cinemas JSON, -- Rạp nào có bán (null = tất cả)
    
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_id (category_id),
    INDEX idx_is_available (is_available),
    FOREIGN KEY (category_id) REFERENCES concession_categories(category_id)
);

-- Bảng đơn hàng concession
CREATE TABLE concession_orders (
    concession_order_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT, -- Có thể null nếu mua bắp nước riêng lẻ
    user_id INT,
    
    -- Thông tin đơn hàng
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Thông tin giao hàng/nhận hàng
    cinema_id INT NOT NULL, -- Rạp nào để nhận
    pickup_time TIMESTAMP, -- Thời gian hẹn nhận
    
    -- Tính toán giá
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Trạng thái
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    
    -- Thông tin thanh toán
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
    
    -- Special instructions
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_number (order_number),
    INDEX idx_booking_id (booking_id),
    INDEX idx_cinema_id (cinema_id),
    INDEX idx_status (status),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id)
);

-- Bảng chi tiết đơn hàng concession
CREATE TABLE concession_order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    concession_order_id INT NOT NULL,
    item_id INT NOT NULL,
    
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Customization (nếu có)
    customization_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_concession_order_id (concession_order_id),
    INDEX idx_item_id (item_id),
    FOREIGN KEY (concession_order_id) REFERENCES concession_orders(concession_order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES concession_items(item_id)
);

-- =================================================================
-- 9. BẢNG QUẢN LÝ THANH TOÁN VÀ REFUND
-- =================================================================

-- Bảng giao dịch thanh toán
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Liên kết với đơn hàng
    booking_id INT,
    concession_order_id INT,
    
    payment_reference VARCHAR(255) UNIQUE NOT NULL, -- Reference từ payment gateway
    
    -- Thông tin thanh toán
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'CASH', 'POINTS', 'VOUCHER') NOT NULL,
    payment_provider VARCHAR(100), -- VNPAY, MOMO, ZaloPay, etc.
    
    -- Số tiền
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Trạng thái
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL,
    
    -- Thông tin từ payment gateway
    gateway_transaction_id VARCHAR(255),
    gateway_response JSON, -- Lưu toàn bộ response từ gateway
    
    -- Thời gian
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Thông tin bổ sung
    failure_reason TEXT,
    refund_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payment_reference (payment_reference),
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_completed_at (completed_at),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (concession_order_id) REFERENCES concession_orders(concession_order_id),
    
    -- Ít nhất một trong booking_id hoặc concession_order_id phải có giá trị
    CONSTRAINT chk_payment_order CHECK (
        (booking_id IS NOT NULL AND concession_order_id IS NULL) OR 
        (booking_id IS NULL AND concession_order_id IS NOT NULL) OR
        (booking_id IS NOT NULL AND concession_order_id IS NOT NULL)
    )
);

-- Bảng hoàn tiền và refund
CREATE TABLE refunds (
    refund_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    
    refund_reference VARCHAR(255) UNIQUE NOT NULL,
    
    -- Thông tin hoàn tiền
    refund_amount DECIMAL(12,2) NOT NULL,
    refund_method ENUM('ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'POINTS', 'GIFT_CARD') NOT NULL,
    
    reason ENUM('CUSTOMER_REQUEST', 'SHOWTIME_CANCELLED', 'TECHNICAL_ERROR', 'FRAUD') NOT NULL,
    reason_description TEXT,
    
    -- Trạng thái hoàn tiền
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    
    -- Thông tin xử lý
    processed_by INT, -- User ID của nhân viên xử lý
    processed_at TIMESTAMP NULL,
    
    -- Gateway information
    gateway_refund_id VARCHAR(255),
    gateway_response JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_refund_reference (refund_reference),
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status),
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id),
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
);

-- =================================================================
-- 10. BẢNG HỖ TRỢ VÀ AUDIT
-- =================================================================

-- Bảng log hệ thống
CREATE TABLE system_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Thông tin log
    log_level ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL,
    component VARCHAR(100), -- API, Frontend, Payment, etc.
    action VARCHAR(255), -- login, booking_create, payment_process, etc.
    
    -- Context
    user_id INT NULL,
    session_id VARCHAR(255) NULL,
    ip_address VARCHAR(45),
    
    -- Data
    message TEXT,
    exception_details TEXT,
    request_data JSON,
    response_data JSON,
    
    -- Timing
    duration_ms INT, -- Thời gian xử lý (milliseconds)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_log_level (log_level),
    INDEX idx_component (component),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng cấu hình hệ thống
CREATE TABLE system_configurations (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    data_type ENUM('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    
    description TEXT,
    category VARCHAR(100), -- PAYMENT, BOOKING, PRICING, etc.
    
    -- Validation
    validation_rules JSON, -- Quy tắc validation
    
    -- Audit
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Bảng notifications
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_id INT,
    
    -- Nội dung thông báo
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PROMOTIONAL') DEFAULT 'INFO',
    
    -- Channel gửi
    channels JSON, -- ["EMAIL", "SMS", "PUSH", "IN_APP"]
    
    -- Template và personalization
    template_id VARCHAR(100),
    template_data JSON,
    
    -- Trạng thái
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Delivery status
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_notification_type (notification_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =================================================================
-- 11. DỮ LIỆU MẪU (SAMPLE DATA)
-- =================================================================

-- Insert roles
INSERT INTO roles (role_name, description) VALUES 
('CUSTOMER', 'Khách hàng thông thường'),
('CINEMA_STAFF', 'Nhân viên rạp'),
('CINEMA_MANAGER', 'Quản lý rạp'),
('SYSTEM_ADMIN', 'Quản trị viên hệ thống');

-- Insert membership tiers
INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, points_earn_rate, tier_level, birthday_gift_description, free_tickets_per_year) VALUES
('BRONZE', 'Thành viên Đồng', 0, 1.0, 1, 'Combo bắp nước sinh nhật', 0),
('SILVER', 'Thành viên Bạc', 2000000, 1.2, 2, 'Combo bắp nước + 1 vé 2D', 1),
('GOLD', 'Thành viên Vàng', 5000000, 1.5, 3, 'Combo bắp nước + 2 vé 2D/3D', 2),
('PLATINUM', 'Thành viên Bạch Kim', 10000000, 2.0, 4, 'Combo bắp nước + 3 vé mọi định dạng', 4),
('DIAMOND', 'Thành viên Kim Cương', 20000000, 2.5, 5, 'Combo bắp nước + 5 vé mọi định dạng + ưu tiên đặt chỗ', 6);

-- Insert cinema chains
INSERT INTO cinema_chains (chain_name, description) VALUES
('CGV Cinemas', 'Chuỗi rạp chiếu phim CGV'),
('Galaxy Cinema', 'Chuỗi rạp chiếu phim Galaxy'),
('Lotte Cinema', 'Chuỗi rạp chiếu phim Lotte'),
('BHD Star Cineplex', 'Chuỗi rạp chiếu phim BHD Star');

-- Insert movie genres
INSERT INTO movie_genres (genre_name, genre_name_en) VALUES
('Hành động', 'Action'),
('Phiêu lưu', 'Adventure'),
('Hài hước', 'Comedy'),
('Chính kịch', 'Drama'),
('Kinh dị', 'Horror'),
('Khoa học viễn tưởng', 'Sci-Fi'),
('Lãng mạn', 'Romance'),
('Hoạt hình', 'Animation'),
('Tài liệu', 'Documentary'),
('Gia đình', 'Family');

-- Insert concession categories
INSERT INTO concession_categories (category_name, description, display_order) VALUES
('Combo Bắp Nước', 'Các combo bắp rang bơ và nước uống', 1),
('Đồ uống', 'Nước ngọt, nước ép, trà sữa', 2),
('Snacks', 'Kẹo, bánh kẹo các loại', 3),
('Thức ăn nhanh', 'Hotdog, bánh mì, nachos', 4);

-- Insert system configurations
INSERT INTO system_configurations (config_key, config_value, data_type, description, category) VALUES
('SEAT_HOLD_DURATION_MINUTES', '10', 'INTEGER', 'Thời gian giữ ghế khi đặt vé (phút)', 'BOOKING'),
('MAX_TICKETS_PER_BOOKING', '8', 'INTEGER', 'Số lượng vé tối đa trong một lần đặt', 'BOOKING'),
('BOOKING_CANCEL_DEADLINE_MINUTES', '60', 'INTEGER', 'Thời gian tối thiểu trước giờ chiếu để hủy vé (phút)', 'BOOKING'),
('POINTS_TO_VND_RATE', '1000', 'DECIMAL', '1 điểm = bao nhiêu VND', 'POINTS'),
('DEFAULT_SERVICE_FEE_PERCENTAGE', '3.0', 'DECIMAL', 'Phí dịch vụ mặc định (%)', 'PAYMENT'),
('MAX_REFUND_REQUESTS_PER_MONTH', '3', 'INTEGER', 'Số lần hủy vé tối đa mỗi tháng', 'REFUND');

-- =================================================================
-- 12. INDEXES VÀ CONSTRAINTS BỔ SUNG
-- =================================================================

-- Thêm các indexes quan trọng cho performance
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_tickets_showtime_status ON tickets(booking_id, status);
CREATE INDEX idx_showtimes_date_cinema ON showtimes(show_date, hall_id);
CREATE INDEX idx_points_user_date ON points_transactions(user_id, created_at);
CREATE INDEX idx_payments_date_status ON payments(completed_at, status);

-- Constraints để đảm bảo data integrity
ALTER TABLE showtimes ADD CONSTRAINT chk_showtime_valid_time 
    CHECK (start_time < end_time);

ALTER TABLE bookings ADD CONSTRAINT chk_booking_amounts 
    CHECK (total_amount >= 0 AND subtotal >= 0);

ALTER TABLE tickets ADD CONSTRAINT chk_ticket_prices 
    CHECK (final_price >= 0 AND base_price >= 0);

ALTER TABLE memberships ADD CONSTRAINT chk_membership_points 
    CHECK (available_points >= 0 AND total_points >= available_points);

-- =================================================================
-- 13. VIEWS ĐỂ HỖ TRỢ REPORTING
-- =================================================================

-- View tổng hợp thông tin booking
CREATE VIEW v_booking_details AS
SELECT 
    b.booking_id,
    b.booking_code,
    b.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    m.title AS movie_title,
    m.age_rating,
    c.cinema_name,
    ch.hall_name,
    s.show_date,
    s.start_time,
    s.format_type,
    b.total_seats,
    b.total_amount,
    b.status AS booking_status,
    b.payment_status,
    b.created_at AS booking_date
FROM bookings b
LEFT JOIN users u ON b.user_id = u.user_id
JOIN showtimes s ON b.showtime_id = s.showtime_id
JOIN movies m ON s.movie_id = m.movie_id
JOIN cinema_halls ch ON s.hall_id = ch.hall_id
JOIN cinemas c ON ch.cinema_id = c.cinema_id;

-- View thống kê doanh thu theo ngày
CREATE VIEW v_daily_revenue AS
SELECT 
    DATE(b.booking_date) AS revenue_date,
    c.cinema_id,
    c.cinema_name,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(b.total_seats) AS total_tickets,
    SUM(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE 0 END) AS total_revenue,
    AVG(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE NULL END) AS avg_booking_value
FROM bookings b
JOIN showtimes s ON b.showtime_id = s.showtime_id
JOIN cinema_halls ch ON s.hall_id = ch.hall_id
JOIN cinemas c ON ch.cinema_id = c.cinema_id
WHERE b.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(b.booking_date), c.cinema_id, c.cinema_name;

-- View hiệu suất phim
CREATE VIEW v_movie_performance AS
SELECT 
    m.movie_id,
    m.title,
    m.age_rating,
    m.status AS movie_status,
    COUNT(DISTINCT s.showtime_id) AS total_showtimes,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(CASE WHEN b.status = 'PAID' THEN b.total_seats ELSE 0 END) AS total_tickets_sold,
    SUM(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE 0 END) AS total_revenue,
    AVG(s.available_seats) AS avg_occupancy_rate
FROM movies m
LEFT JOIN showtimes s ON m.movie_id = s.movie_id
LEFT JOIN bookings b ON s.showtime_id = b.showtime_id
WHERE s.show_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY m.movie_id, m.title, m.age_rating, m.status;

-- =================================================================
-- KẾT THÚC DATABASE SCHEMA
-- =================================================================

-- Commit transaction
COMMIT;

-- Thông báo hoàn thành
SELECT 'Database schema created successfully!' AS Status;