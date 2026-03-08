-- Insert sample showtimes for testing booking feature
-- Giả sử có movies với id 1,2,3,4 và cinemas với id 1,2,3,4,5
-- Cần có cinema_halls trước (insert nếu chưa có)

-- Insert cinema halls nếu chưa có
INSERT IGNORE INTO cinema_halls (hall_id, cinema_id, hall_name, total_seats, rows_count, seats_per_row, hall_type, screen_type, sound_system, is_active) VALUES
(1, 1, 'Phòng 1', 150, 10, 15, 'STANDARD', '2D', 'DOLBY', TRUE),
(2, 1, 'Phòng 2', 120, 8, 15, 'STANDARD', '2D', 'DOLBY', TRUE),
(3, 1, 'Phòng 3', 200, 12, 17, 'VIP', 'IMAX', 'DOLBY_ATMOS', TRUE),
(4, 2, 'Phòng 1', 140, 9, 16, 'STANDARD', '2D', 'DOLBY', TRUE),
(5, 2, 'Phòng 2', 180, 11, 17, 'VIP', '3D', 'DOLBY_ATMOS', TRUE),
(6, 3, 'Phòng 1', 130, 9, 15, 'STANDARD', '2D', 'DOLBY', TRUE),
(7, 3, 'Phòng 2', 160, 10, 16, 'VIP', 'IMAX', 'DOLBY_ATMOS', TRUE),
(8, 4, 'Phòng 1', 150, 10, 15, 'STANDARD', '2D', 'DOLBY', TRUE),
(9, 4, 'Phòng 2', 170, 11, 16, 'VIP', '3D', 'DOLBY_ATMOS', TRUE),
(10, 5, 'Phòng 1', 140, 9, 16, 'STANDARD', '2D', 'DOLBY', TRUE);

-- Insert showtimes for next 7 days
-- Cinema 1: CGV Vincom Center - Movies 1,2,3
INSERT INTO showtimes (hall_id, movie_id, show_date, start_time, end_time, base_price, available_seats, format_type, subtitle_language, status) VALUES
-- Movie 1 - Spider-Man (148 phút = 2h28)
(1, 1, CURDATE(), '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE(), '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE(), '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '19:00:00', '21:28:00', 100000, 150, '2D', 'Vietsub', 'ACTIVE'),

-- Movie 2 - Black Panther (161 phút = 2h41)
(2, 2, CURDATE(), '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE(), '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE(), '20:00:00', '22:41:00', 105000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 1 DAY, '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 1 DAY, '15:00:00', '17:41:00', 95000, 120, '2D', 'Vietsub', 'ACTIVE'),

-- Movie 3 - Doraemon (108 phút = 1h48)
(3, 3, CURDATE(), '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE(), '13:30:00', '15:18:00', 75000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE(), '17:30:00', '19:18:00', 80000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 1 DAY, '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 1 DAY, '13:30:00', '15:18:00', 75000, 200, '2D', 'Vietsub', 'ACTIVE'),

-- Cinema 2: CGV Aeon Mall - Movies 1,4
(4, 1, CURDATE(), '11:00:00', '13:28:00', 85000, 140, '2D', 'Vietsub', 'ACTIVE'),
(4, 1, CURDATE(), '16:00:00', '18:28:00', 95000, 140, '2D', 'Vietsub', 'ACTIVE'),
(4, 1, CURDATE(), '21:00:00', '23:28:00', 105000, 140, '2D', 'Vietsub', 'ACTIVE'),

(5, 4, CURDATE(), '10:00:00', '13:00:00', 90000, 180, '3D', 'Vietsub', 'ACTIVE'),
(5, 4, CURDATE(), '15:00:00', '18:00:00', 100000, 180, '3D', 'Vietsub', 'ACTIVE'),
(5, 4, CURDATE(), '20:00:00', '23:00:00', 110000, 180, '3D', 'Vietsub', 'ACTIVE'),

-- Cinema 3: Galaxy MIPEC - Movies 2,3
(6, 2, CURDATE(), '09:00:00', '11:41:00', 80000, 130, '2D', 'Vietsub', 'ACTIVE'),
(6, 2, CURDATE(), '14:00:00', '16:41:00', 90000, 130, '2D', 'Vietsub', 'ACTIVE'),
(6, 2, CURDATE(), '19:00:00', '21:41:00', 100000, 130, '2D', 'Vietsub', 'ACTIVE'),

(7, 3, CURDATE(), '10:00:00', '11:48:00', 75000, 160, 'IMAX', 'Vietsub', 'ACTIVE'),
(7, 3, CURDATE(), '14:00:00', '15:48:00', 85000, 160, 'IMAX', 'Vietsub', 'ACTIVE'),
(7, 3, CURDATE(), '18:00:00', '19:48:00', 95000, 160, 'IMAX', 'Vietsub', 'ACTIVE'),

-- Cinema 4: Lotte Cinema - Movies 1,2,3
(8, 1, CURDATE(), '10:00:00', '12:28:00', 85000, 150, '2D', 'Vietsub', 'ACTIVE'),
(8, 1, CURDATE(), '15:00:00', '17:28:00', 95000, 150, '2D', 'Vietsub', 'ACTIVE'),
(8, 1, CURDATE(), '20:00:00', '22:28:00', 105000, 150, '2D', 'Vietsub', 'ACTIVE'),

(9, 2, CURDATE(), '11:00:00', '13:41:00', 90000, 170, '3D', 'Vietsub', 'ACTIVE'),
(9, 2, CURDATE(), '16:00:00', '18:41:00', 100000, 170, '3D', 'Vietsub', 'ACTIVE'),

-- Cinema 5: BHD Star - Movies 3,4
(10, 3, CURDATE(), '09:00:00', '10:48:00', 70000, 140, '2D', 'Vietsub', 'ACTIVE'),
(10, 3, CURDATE(), '13:00:00', '14:48:00', 75000, 140, '2D', 'Vietsub', 'ACTIVE'),
(10, 3, CURDATE(), '17:00:00', '18:48:00', 80000, 140, '2D', 'Vietsub', 'ACTIVE'),

(10, 4, CURDATE(), '11:00:00', '14:00:00', 90000, 140, '2D', 'Vietsub', 'ACTIVE'),
(10, 4, CURDATE(), '16:00:00', '19:00:00', 95000, 140, '2D', 'Vietsub', 'ACTIVE'),
(10, 4, CURDATE(), '21:00:00', '00:00:00', 100000, 140, '2D', 'Vietsub', 'ACTIVE');

-- Add more showtimes for next 2-3 days
INSERT INTO showtimes (hall_id, movie_id, show_date, start_time, end_time, base_price, available_seats, format_type, subtitle_language, status) VALUES
(1, 1, CURDATE() + INTERVAL 2 DAY, '09:00:00', '11:28:00', 80000, 150, '2D', 'Vietsub', 'ACTIVE'),
(1, 1, CURDATE() + INTERVAL 2 DAY, '14:00:00', '16:28:00', 90000, 150, '2D', 'Vietsub', 'ACTIVE'),
(2, 2, CURDATE() + INTERVAL 2 DAY, '10:00:00', '12:41:00', 85000, 120, '2D', 'Vietsub', 'ACTIVE'),
(3, 3, CURDATE() + INTERVAL 2 DAY, '09:30:00', '11:18:00', 70000, 200, '2D', 'Vietsub', 'ACTIVE'),
(4, 1, CURDATE() + INTERVAL 2 DAY, '11:00:00', '13:28:00', 85000, 140, '2D', 'Vietsub', 'ACTIVE'),
(6, 2, CURDATE() + INTERVAL 2 DAY, '09:00:00', '11:41:00', 80000, 130, '2D', 'Vietsub', 'ACTIVE'),
(8, 1, CURDATE() + INTERVAL 2 DAY, '10:00:00', '12:28:00', 85000, 150, '2D', 'Vietsub', 'ACTIVE'),
(10, 3, CURDATE() + INTERVAL 2 DAY, '09:00:00', '10:48:00', 70000, 140, '2D', 'Vietsub', 'ACTIVE');

SELECT 'Đã insert thành công showtimes!' as message;
