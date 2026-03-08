-- Add cinema_halls table if not exists
CREATE TABLE IF NOT EXISTS cinema_halls (
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

-- Create unique index for hall name per cinema
ALTER TABLE cinema_halls ADD CONSTRAINT uk_cinema_hall_name UNIQUE (cinema_id, hall_name);
