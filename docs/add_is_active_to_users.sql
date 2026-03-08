-- Kiểm tra và thêm cột is_active vào bảng users nếu chưa có
-- Chạy script này trong MySQL để đảm bảo database có cột is_active

-- Thêm cột is_active nếu chưa có
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE 
COMMENT 'User account status - FALSE means account is deactivated/soft deleted';

-- Cập nhật tất cả users hiện tại thành active
UPDATE users 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Kiểm tra kết quả
SELECT user_id, email, full_name, is_active 
FROM users 
LIMIT 10;
