-- ============================================================================
-- Movie Ticket Sales Web Project - Authentication System Database Setup
-- ============================================================================

-- 1. INSERT DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (role_id, role_name, description, created_at) 
VALUES (1, 'CUSTOMER', 'Regular customer role for ticket booking', NOW());

INSERT INTO roles (role_id, role_name, description, created_at) 
VALUES (2, 'ADMIN', 'Administrator with full system access', NOW());

INSERT INTO roles (role_id, role_name, description, created_at) 
VALUES (3, 'STAFF', 'Staff member for customer support', NOW());

INSERT INTO roles (role_id, role_name, description, created_at) 
VALUES (4, 'MANAGER', 'Manager for cinema operations', NOW());

-- Verify insertion
SELECT * FROM roles;

-- ============================================================================
-- 2. INSERT DEFAULT MEMBERSHIP TIERS
-- ============================================================================

INSERT INTO membership_tiers (
    tier_id,
    tier_name, 
    tier_name_display, 
    min_annual_spending, 
    min_visits_per_year, 
    points_earn_rate, 
    discount_percentage, 
    free_tickets_per_year, 
    priority_booking, 
    free_upgrades, 
    tier_level, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    1,
    'BRONZE', 
    'Bronze Member', 
    0, 
    0, 
    1.0, 
    0, 
    0, 
    0, 
    0, 
    1, 
    1, 
    NOW(), 
    NOW()
);

INSERT INTO membership_tiers (
    tier_id,
    tier_name, 
    tier_name_display, 
    min_annual_spending, 
    min_visits_per_year, 
    points_earn_rate, 
    discount_percentage, 
    free_tickets_per_year, 
    priority_booking, 
    free_upgrades, 
    tier_level, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    2,
    'SILVER', 
    'Silver Member', 
    5000000, 
    12, 
    1.5, 
    5, 
    2, 
    1, 
    0, 
    2, 
    1, 
    NOW(), 
    NOW()
);

INSERT INTO membership_tiers (
    tier_id,
    tier_name, 
    tier_name_display, 
    min_annual_spending, 
    min_visits_per_year, 
    points_earn_rate, 
    discount_percentage, 
    free_tickets_per_year, 
    priority_booking, 
    free_upgrades, 
    tier_level, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    3,
    'GOLD', 
    'Gold Member', 
    20000000, 
    24, 
    2.0, 
    10, 
    5, 
    1, 
    1, 
    3, 
    1, 
    NOW(), 
    NOW()
);

INSERT INTO membership_tiers (
    tier_id,
    tier_name, 
    tier_name_display, 
    min_annual_spending, 
    min_visits_per_year, 
    points_earn_rate, 
    discount_percentage, 
    free_tickets_per_year, 
    priority_booking, 
    free_upgrades, 
    tier_level, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    4,
    'PLATINUM', 
    'Platinum Member', 
    50000000, 
    36, 
    2.5, 
    15, 
    10, 
    1, 
    1, 
    4, 
    1, 
    NOW(), 
    NOW()
);

-- Verify insertion
SELECT * FROM membership_tiers;

-- ============================================================================
-- 3. TEST DATA - CREATE TEST USERS (Optional)
-- ============================================================================

-- Test User 1 - admin@example.com (BCrypted password: Admin123!)
-- Password hash generated with: BCryptPasswordEncoder.encode("Admin123!")
INSERT INTO users (
    user_id,
    email, 
    phone_number, 
    password_hash, 
    full_name, 
    date_of_birth, 
    gender, 
    avatar_url, 
    is_active, 
    is_email_verified, 
    is_phone_verified, 
    email_verified_at, 
    phone_verified_at, 
    privacy_policy_accepted, 
    privacy_policy_version, 
    privacy_policy_accepted_at, 
    terms_of_service_accepted, 
    terms_of_service_version, 
    terms_of_service_accepted_at, 
    marketing_email_consent, 
    marketing_sms_consent, 
    last_login_at, 
    failed_login_attempts, 
    locked_until, 
    password_reset_token, 
    password_reset_expires, 
    created_at, 
    updated_at
) VALUES (
    1,
    'admin@example.com',
    '0900000001',
    '$2a$10$MvkPhQV/5L1R5Cxm6CQsA.xH6bVeGGSvQzJCK5P/1MdQZvPLG5Kky',
    'Admin User',
    '1990-01-01',
    'MALE',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW(),
    1,
    '1.0',
    NOW(),
    1,
    '1.0',
    NOW(),
    1,
    0,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- Test User 2 - customer@example.com (BCrypted password: Customer123!)
INSERT INTO users (
    user_id,
    email, 
    phone_number, 
    password_hash, 
    full_name, 
    date_of_birth, 
    gender, 
    is_active, 
    is_email_verified, 
    privacy_policy_accepted, 
    privacy_policy_version, 
    privacy_policy_accepted_at, 
    terms_of_service_accepted, 
    terms_of_service_version, 
    terms_of_service_accepted_at, 
    created_at, 
    updated_at
) VALUES (
    2,
    'customer@example.com',
    '0900000002',
    '$2a$10$n9XLFhJcFfJWYLAJDr/6BukGQrZl0PvC.1BnV4vVwXd8EqaLhXXrG',
    'Customer User',
    '1995-05-15',
    'FEMALE',
    1,
    0,
    1,
    '1.0',
    NOW(),
    1,
    '1.0',
    NOW(),
    NOW(),
    NOW()
);

-- Verify insertion
SELECT user_id, email, full_name, is_active FROM users LIMIT 10;

-- ============================================================================
-- 4. ASSIGN ROLES TO TEST USERS
-- ============================================================================

-- Assign ADMIN role to admin@example.com
INSERT INTO user_roles (
    user_role_id,
    user_id, 
    role_id, 
    assigned_at
) VALUES (
    1,
    1, 
    2, 
    NOW()
);

-- Assign CUSTOMER role to customer@example.com
INSERT INTO user_roles (
    user_role_id,
    user_id, 
    role_id, 
    assigned_at
) VALUES (
    2,
    2, 
    1, 
    NOW()
);

-- Verify role assignments
SELECT ur.user_role_id, u.email, r.role_name, ur.assigned_at 
FROM user_roles ur
JOIN users u ON ur.user_id = u.user_id
JOIN roles r ON ur.role_id = r.role_id;

-- ============================================================================
-- 5. CREATE MEMBERSHIPS FOR TEST USERS
-- ============================================================================

-- Membership for admin@example.com
INSERT INTO memberships (
    membership_id,
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
) VALUES (
    1,
    1, 
    'MB000000001', 
    1, 
    0, 
    0, 
    0, 
    0, 
    0, 
    CURDATE(), 
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 
    'ACTIVE', 
    NOW(), 
    NOW()
);

-- Membership for customer@example.com
INSERT INTO memberships (
    membership_id,
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
) VALUES (
    2,
    2, 
    'MB000000002', 
    1, 
    100, 
    100, 
    0, 
    0, 
    1, 
    CURDATE(), 
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 
    'ACTIVE', 
    NOW(), 
    NOW()
);

-- Verify memberships
SELECT m.membership_id, u.email, m.membership_number, mt.tier_name, m.available_points, m.status
FROM memberships m
JOIN users u ON m.user_id = u.user_id
JOIN membership_tiers mt ON m.tier_id = mt.tier_id;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check all data is properly set up
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Membership Tiers', COUNT(*) FROM membership_tiers
UNION ALL
SELECT 'Memberships', COUNT(*) FROM memberships;

-- Display complete user information
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles,
    m.membership_number,
    mt.tier_name,
    m.available_points,
    m.status,
    u.is_active
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
LEFT JOIN memberships m ON u.user_id = m.user_id
LEFT JOIN membership_tiers mt ON m.tier_id = mt.tier_id
GROUP BY u.user_id, u.email, u.full_name, m.membership_number, mt.tier_name, m.available_points, m.status, u.is_active;

-- ============================================================================
-- 7. CLEANUP (IF NEEDED - Run this to remove test data)
-- ============================================================================

-- UNCOMMENT BELOW TO CLEAN UP TEST DATA

/*
-- Delete test memberships
DELETE FROM memberships WHERE user_id IN (1, 2);

-- Delete test user roles
DELETE FROM user_roles WHERE user_id IN (1, 2);

-- Delete test users
DELETE FROM users WHERE user_id IN (1, 2);

-- Verify cleanup
SELECT COUNT(*) as total_users FROM users;
*/

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================

-- NOTE: Password Hashes for Test Users:
-- admin@example.com: $2a$10$MvkPhQV/5L1R5Cxm6CQsA.xH6bVeGGSvQzJCK5P/1MdQZvPLG5Kky = "Admin123!"
-- customer@example.com: $2a$10$n9XLFhJcFfJWYLAJDr/6BukGQrZl0PvC.1BnV4vVwXd8EqaLhXXrG = "Customer123!"

-- To login with these test users:
-- Email: admin@example.com
-- Password: Admin123!

-- Email: customer@example.com
-- Password: Customer123!
