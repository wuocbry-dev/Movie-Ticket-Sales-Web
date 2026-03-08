-- Create cinema_halls table
-- Execute this script in your MySQL database
-- mysql -h HOST -P PORT -u username -p database_name < CREATE_CINEMA_HALLS_TABLE.sql

DROP TABLE IF EXISTS cinema_halls;

CREATE TABLE cinema_halls (
    hall_id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_id INT NOT NULL,
    hall_name VARCHAR(100) NOT NULL,
    hall_type ENUM('2D', 'IMAX', '4DX', '3D') DEFAULT '2D',
    total_seats INT NOT NULL,
    rows_count INT,
    seats_per_row INT,
    seat_layout JSON,
    screen_type VARCHAR(100),
    sound_system VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (updated_by) REFERENCES users(user_id),
    INDEX idx_cinema_id (cinema_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY uk_cinema_hall_name (cinema_id, hall_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test insert
INSERT INTO cinema_halls (cinema_id, hall_name, total_seats, rows_count, seats_per_row) 
VALUES (1, 'Screen 1', 100, 10, 10);

SELECT * FROM cinema_halls;
