-- Cập nhật showtimes với ngày hiện tại và các ngày tiếp theo
-- Xóa dữ liệu cũ
DELETE FROM showtimes;

-- Insert showtimes mới với ngày hiện tại
INSERT INTO showtimes (hall_id, movie_id, show_date, start_time, end_time, base_price, available_seats, format_type, subtitle_language, status) VALUES
-- Hôm nay - Movie 1
(1, 1, CURDATE(), '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE(), '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE(), '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),

-- Hôm nay - Movie 2
(2, 2, CURDATE(), '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE(), '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE(), '20:00:00', '22:41:00', 105000, 120, '2D', 'Vietsub', 'ACTIVE'),

-- Hôm nay - Movie 3
(3, 3, CURDATE(), '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE(), '13:30:00', '15:18:00', 75000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE(), '17:30:00', '19:18:00', 80000, 200, '2D', 'Vietsub', 'ACTIVE'),

-- Hôm nay - Movie 4
(4, 4, CURDATE(), '10:00:00', '13:00:00', 90000, 140, '3D', 'Vietsub', 'ACTIVE'),
(4, 4, CURDATE(), '15:00:00', '18:00:00', 100000, 140, '3D', 'Vietsub', 'ACTIVE'),
(4, 4, CURDATE(), '20:00:00', '23:00:00', 110000, 140, '3D', 'Vietsub', 'ACTIVE'),

-- Ngày mai - Movie 1
(1, 1, CURDATE() + INTERVAL 1 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),

-- Ngày mai - Movie 2
(2, 2, CURDATE() + INTERVAL 1 DAY, '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 1 DAY, '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 1 DAY, '20:00:00', '22:41:00', 105000, 120, '2D', 'Vietsub', 'ACTIVE'),

-- Ngày mai - Movie 3
(3, 3, CURDATE() + INTERVAL 1 DAY, '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 1 DAY, '13:30:00', '15:18:00', 75000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 1 DAY, '17:30:00', '19:18:00', 80000, 200, '2D', 'Vietsub', 'ACTIVE'),

-- Ngày mai - Movie 4
(5, 4, CURDATE() + INTERVAL 1 DAY, '10:00:00', '13:00:00', 90000, 180, '3D', 'Vietsub', 'ACTIVE'),
(5, 4, CURDATE() + INTERVAL 1 DAY, '15:00:00', '18:00:00', 100000, 180, '3D', 'Vietsub', 'ACTIVE'),
(5, 4, CURDATE() + INTERVAL 1 DAY, '20:00:00', '23:00:00', 110000, 180, '3D', 'Vietsub', 'ACTIVE'),

-- 2 ngày sau - Movie 1
(1, 1, CURDATE() + INTERVAL 2 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 2 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 2 DAY, '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),

-- 2 ngày sau - Movie 2
(2, 2, CURDATE() + INTERVAL 2 DAY, '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 2 DAY, '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),

-- 3 ngày sau - Movie 1
(1, 1, CURDATE() + INTERVAL 3 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 3 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 3 DAY, '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),

-- 3 ngày sau - Movie 3
(3, 3, CURDATE() + INTERVAL 3 DAY, '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 3 DAY, '13:30:00', '15:18:00', 75000, 200, '2D', 'Vietsub', 'ACTIVE'),

-- 4 ngày sau - Movie 2
(2, 2, CURDATE() + INTERVAL 4 DAY, '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 4 DAY, '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 4 DAY, '20:00:00', '22:41:00', 105000, 120, '2D', 'Vietsub', 'ACTIVE'),

-- 5 ngày sau - Movie 4
(4, 4, CURDATE() + INTERVAL 5 DAY, '10:00:00', '13:00:00', 90000, 140, '3D', 'Vietsub', 'ACTIVE'),
(4, 4, CURDATE() + INTERVAL 5 DAY, '15:00:00', '18:00:00', 100000, 140, '3D', 'Vietsub', 'ACTIVE'),

-- 6 ngày sau - Movie 1
(1, 1, CURDATE() + INTERVAL 6 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 6 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 6 DAY, '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE');

SELECT 'Showtimes updated successfully!' as message;
