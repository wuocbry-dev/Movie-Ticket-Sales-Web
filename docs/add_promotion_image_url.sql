-- Thêm cột ảnh khuyến mãi (lưu URL từ S3)
-- Chạy script này nếu bảng promotions chưa có cột image_url

ALTER TABLE promotions
ADD COLUMN image_url VARCHAR(512) NULL
COMMENT 'URL ảnh khuyến mãi (S3)'
AFTER promotion_name;
