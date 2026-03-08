-- Script để gán role SYSTEM_ADMIN cho user quoc2004@gmail.com (user_id = 2)
-- Chạy script này trong MySQL để khắc phục lỗi 401 Unauthorized

-- 1. Tạo các role cần thiết nếu chưa tồn tại
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES 
    ('SYSTEM_ADMIN', 'System administrator with full access', NOW()),
    ('ADMIN', 'Administrator role with full system access', NOW()),
    ('CINEMA_CHAIN_ADMIN', 'Cinema chain administrator', NOW()),
    ('CINEMA_MANAGER', 'Cinema manager', NOW());

-- 2. Gán role SYSTEM_ADMIN cho user_id = 2 (quoc2004@gmail.com)
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 2, r.role_id, NOW()
FROM roles r
WHERE r.role_name = 'SYSTEM_ADMIN';

-- 3. Gán thêm role ADMIN (backup)
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 2, r.role_id, NOW()
FROM roles r
WHERE r.role_name = 'ADMIN';

-- 4. Kiểm tra kết quả
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    GROUP_CONCAT(r.role_name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.user_id = 2
GROUP BY u.user_id, u.email, u.full_name;

-- 5. Xóa tất cả user_roles cũ và gán lại (nếu cần)
-- DELETE FROM user_roles WHERE user_id = 2;
-- Sau đó chạy lại INSERT ở bước 2 và 3
