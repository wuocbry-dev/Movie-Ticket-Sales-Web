-- ============================================================
-- MySQL: 6 khuyến mãi mẫu (chỉ dữ liệu, không ảnh)
-- Ảnh: bạn tự cập nhật sau trong Admin → Khuyến mãi → Sửa
-- ============================================================
--
-- CÁCH CHẠY TRONG MYSQL:
--
-- 1. Dòng lệnh (thay <user>, <database> bằng user và tên database của bạn):
--    mysql -u <user> -p <database> < insert_6_promotions_sample.sql
--
-- 2. Hoặc mở MySQL Workbench / phpMyAdmin / DBeaver:
--    - Chọn database
--    - Mở file này và chạy (Execute)
--
-- Nếu bảng CHƯA có cột image_url: chạy file insert_6_promotions_no_image_url.sql thay vì file này.
-- ============================================================

INSERT INTO promotions (
  promotion_code, promotion_name, description, promotion_type, image_url,
  discount_percentage, discount_amount, min_purchase_amount, max_discount_amount,
  start_date, end_date, max_usage_total, max_usage_per_user, current_usage, is_active,
  created_at, updated_at, created_by
) VALUES
('SUMMER25', 'Xong mùa thi Quẩy mùa hè!',
  'Áp dụng dành cho khách hàng thành viên thuộc đối tượng Học sinh - Sinh viên. Tặng 1 nước ngọt miễn phí khi giao dịch từ 2 vé xem phim trở lên.',
  'FREE_ITEM', NULL, NULL, NULL, 0, NULL,
  NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 2000, 1, 0, 1, NOW(), NOW(), NULL),

('MOMO58', 'BETA VÉ RẺ MOMO MUA LIỀN!',
  '58.000₫/vé Thứ 2 - Thứ 6; 62.000₫/vé Thứ 7 - Chủ nhật. Áp dụng khi thanh toán qua Ví MoMo.',
  'FIXED_AMOUNT', NULL, NULL, 42000, 100000, NULL,
  NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1000, 2, 0, 1, NOW(), NOW(), NULL),

('OFF20', '20% OFF',
  'Giảm 20% giá vé xem phim. Áp dụng cho tất cả suất chiếu. Đơn tối thiểu 150.000₫.',
  'PERCENTAGE', NULL, 20.00, NULL, 150000, 50000,
  NOW(), DATE_ADD(NOW(), INTERVAL 120 DAY), 3000, 2, 0, 1, NOW(), NOW(), NULL),

('COMBO2VE', 'Mua 2 vé tặng 1 Bắp',
  'Khi mua từ 2 vé xem phim trở lên được tặng 1 bắp size M.',
  'BUY_X_GET_Y', NULL, NULL, NULL, 120000, NULL,
  NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 500, 1, 0, 1, NOW(), NOW(), NULL),

('MEMBER50K', 'Thành viên giảm 50.000₫',
  'Áp dụng cho tài khoản có hạng thành viên (GOLD/PLATINUM). Giảm 50.000₫ trên đơn từ 200.000₫.',
  'FIXED_AMOUNT', NULL, NULL, 50000, 200000, 50000,
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NULL, 1, 0, 1, NOW(), NOW(), NULL),

('DOUBLEPOINT', 'Nhân đôi điểm thưởng',
  'Giao dịch trong thời gian khuyến mãi được nhân đôi điểm tích lũy.',
  'POINTS_MULTIPLIER', NULL, NULL, NULL, 0, NULL,
  NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, NULL, 0, 1, NOW(), NOW(), NULL);
