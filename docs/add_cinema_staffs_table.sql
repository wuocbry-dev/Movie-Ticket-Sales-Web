-- =================================================================
-- CINEMA STAFFS TABLE - Bảng liên kết nhân viên với rạp
-- =================================================================
-- File: add_cinema_staffs_table.sql
-- Description: Tạo bảng để quản lý nhân viên làm việc tại từng rạp
-- Ngày tạo: 2025-12-08
-- =================================================================

USE movie_ticket_sales;

-- Tạo bảng cinema_staffs
CREATE TABLE IF NOT EXISTS cinema_staffs (
    cinema_staff_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Nhân viên (User với role CINEMA_STAFF)
    user_id INT NOT NULL,
    
    -- Rạp chiếu phim mà nhân viên làm việc
    cinema_id INT NOT NULL,
    
    -- Trạng thái hoạt động
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Chức vụ/vị trí tại rạp (CASHIER, TICKET_CHECKER, CONCESSION, etc.)
    position VARCHAR(100),
    
    -- Ngày bắt đầu làm việc
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ngày kết thúc (nếu đã nghỉ việc)
    end_date TIMESTAMP NULL,
    
    -- Người gán staff vào rạp
    assigned_by INT NULL,
    
    -- Ghi chú
    notes VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_user_cinema (user_id, cinema_id),
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_cinema_id (cinema_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- =================================================================
-- INSERT SAMPLE DATA (Optional)
-- =================================================================

-- Gán staff vào rạp (ví dụ: user_id = 5 là staff, cinema_id = 1)
-- INSERT INTO cinema_staffs (user_id, cinema_id, position, notes)
-- VALUES (5, 1, 'TICKET_CHECKER', 'Nhân viên kiểm vé');

-- =================================================================
-- QUERIES HƯỚNG DẪN
-- =================================================================

-- 1. Xem tất cả nhân viên của một rạp
-- SELECT cs.*, u.full_name, u.email 
-- FROM cinema_staffs cs 
-- JOIN users u ON cs.user_id = u.user_id 
-- WHERE cs.cinema_id = 1 AND cs.is_active = TRUE;

-- 2. Xem rạp mà một nhân viên đang làm việc
-- SELECT cs.*, c.cinema_name, c.address 
-- FROM cinema_staffs cs 
-- JOIN cinemas c ON cs.cinema_id = c.cinema_id 
-- WHERE cs.user_id = 5 AND cs.is_active = TRUE;

-- 3. Gán staff vào rạp
-- INSERT INTO cinema_staffs (user_id, cinema_id, position, assigned_by)
-- VALUES (user_id, cinema_id, 'TICKET_CHECKER', manager_user_id);

-- 4. Cho staff nghỉ việc
-- UPDATE cinema_staffs 
-- SET is_active = FALSE, end_date = CURRENT_TIMESTAMP 
-- WHERE user_id = ? AND cinema_id = ?;
