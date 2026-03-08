-- Script to update existing SYSTEM_ADMIN role and ensure proper setup
-- Run this script against your existing database

-- 1. Ensure SYSTEM_ADMIN role exists and is properly configured
UPDATE roles 
SET description = 'System Administrator role with full system access'
WHERE role_name = 'SYSTEM_ADMIN';

-- If SYSTEM_ADMIN doesn't exist, create it
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('SYSTEM_ADMIN', 'System Administrator role with full system access', NOW());

-- 2. Ensure other roles exist
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('STAFF', 'Staff role with limited system access', NOW());

INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('CUSTOMER', 'Customer role with standard user access', NOW());

-- 3. Verify admin user exists - if not, create one
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

-- 4. Ensure admin user has SYSTEM_ADMIN role
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT u.user_id, r.role_id, NOW()
FROM users u, roles r
WHERE u.email = 'admin@movieticket.com' 
AND r.role_name = 'SYSTEM_ADMIN';

-- 5. Create admin membership tier if it doesn't exist
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

-- 6. Create membership for admin user if it doesn't exist
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

-- 7. Display current admin setup for verification
SELECT 'Current admin user roles:' as info;
SELECT u.email, u.full_name, r.role_name, ur.assigned_at
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@movieticket.com';