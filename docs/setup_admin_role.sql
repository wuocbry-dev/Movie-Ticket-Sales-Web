-- Script để thêm role ADMIN vào database
-- Chạy script này để setup role admin cho hệ thống

-- 1. Thêm role ADMIN nếu chưa tồn tại
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('ADMIN', 'Administrator role with full system access', NOW());

-- 2. Thêm role STAFF nếu chưa tồn tại
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('STAFF', 'Staff role with limited system access', NOW());

-- 3. Cập nhật role CUSTOMER nếu cần
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('CUSTOMER', 'Customer role with standard user access', NOW());

-- 4. Tạo user admin mẫu (password: Admin123!)
-- Note: Thay đổi email và password theo yêu cầu thực tế
INSERT IGNORE INTO users (
    email, 
    password_hash, 
    full_name, 
    is_active, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'admin@movieticket.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: Admin123!
    'System Administrator',
    1,
    1,
    NOW(),
    NOW()
);

-- 5. Gán role ADMIN cho user admin
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT u.user_id, r.role_id, NOW()
FROM users u, roles r
WHERE u.email = 'admin@movieticket.com' 
AND r.role_name = 'ADMIN';

-- 6. Tạo membership cho admin user
INSERT IGNORE INTO membership_tiers (
    tier_name, 
    tier_name_display, 
    tier_level, 
    min_annual_spending, 
    min_visits_per_year, 
    points_earn_rate, 
    discount_percentage, 
    free_tickets_per_year, 
    priority_booking, 
    free_upgrades, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'ADMIN', 
    'Administrator', 
    999, 
    0, 
    0, 
    1.0, 
    0, 
    0, 
    1, 
    1, 
    1, 
    NOW(), 
    NOW()
);

-- 7. Tạo membership cho admin user
INSERT IGNORE INTO memberships (
    user_id,
    membership_number,
    tier_id,
    total_points,
    available_points,
    lifetime_spending,
    annual_spending,
    total_visits,
    tier_start_date,
    next_tier_review_date,
    status,
    created_at,
    updated_at
)
SELECT 
    u.user_id,
    CONCAT('ADMIN', LPAD(u.user_id, 6, '0')),
    mt.tier_id,
    0,
    0,
    0.00,
    0.00,
    0,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    'ACTIVE',
    NOW(),
    NOW()
FROM users u, membership_tiers mt
WHERE u.email = 'admin@movieticket.com' 
AND mt.tier_name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM memberships m WHERE m.user_id = u.user_id
);