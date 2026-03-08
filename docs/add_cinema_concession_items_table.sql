-- Migration script: Add cinema_concession_items table for per-cinema pricing
-- Author: System
-- Date: 2025-12-06
-- Description: Allows each cinema to have different prices and stock for concession items

-- Create cinema_concession_items table
CREATE TABLE cinema_concession_items (
    cinema_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_id INT NOT NULL,
    item_id INT NOT NULL,
    cinema_price DECIMAL(10, 2) NULL COMMENT 'Giá bán tại rạp này (NULL = dùng giá mặc định)',
    cinema_cost_price DECIMAL(10, 2) NULL COMMENT 'Giá vốn tại rạp này',
    stock_quantity INT DEFAULT 0 COMMENT 'Số lượng tồn kho',
    is_available TINYINT(1) DEFAULT 1 COMMENT 'Có bán tại rạp này không',
    display_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    notes VARCHAR(500) NULL COMMENT 'Ghi chú riêng cho rạp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_cinema_concession_cinema 
        FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    CONSTRAINT fk_cinema_concession_item 
        FOREIGN KEY (item_id) REFERENCES concession_items(item_id) ON DELETE CASCADE,
    
    -- Unique constraint: mỗi item chỉ có 1 bản ghi cho mỗi rạp
    CONSTRAINT uq_cinema_item UNIQUE (cinema_id, item_id),
    
    -- Index for better query performance
    INDEX idx_cinema_available (cinema_id, is_available),
    INDEX idx_stock (cinema_id, stock_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Quản lý giá và tồn kho bắp nước theo từng rạp';

-- Insert sample data: Sync all existing items to all cinemas with default pricing
-- Điều này tạo sẵn dữ liệu cho tất cả rạp, sau đó manager có thể chỉnh sửa giá
INSERT INTO cinema_concession_items (cinema_id, item_id, cinema_price, is_available, display_order)
SELECT 
    c.cinema_id,
    ci.item_id,
    ci.price as cinema_price,  -- Bắt đầu với giá mặc định
    ci.is_available,
    0 as display_order
FROM cinemas c
CROSS JOIN concession_items ci
WHERE ci.is_available = 1
ON DUPLICATE KEY UPDATE cinema_item_id = cinema_item_id; -- Không làm gì nếu đã tồn tại

-- Optional: Set different prices for demonstration
-- Rạp 1: Giá cao hơn 10%
UPDATE cinema_concession_items cci
JOIN concession_items ci ON cci.item_id = ci.item_id
SET cci.cinema_price = ci.price * 1.10
WHERE cci.cinema_id = 1;

-- Rạp 2: Giá thấp hơn 5% (khuyến mãi)
UPDATE cinema_concession_items cci
JOIN concession_items ci ON cci.item_id = ci.item_id
SET cci.cinema_price = ci.price * 0.95
WHERE cci.cinema_id = 2;

-- Add stock for all items (random demo data)
UPDATE cinema_concession_items 
SET stock_quantity = FLOOR(50 + RAND() * 100)
WHERE stock_quantity = 0;

-- Create a view for easy querying (optional)
CREATE OR REPLACE VIEW v_cinema_concession_prices AS
SELECT 
    cci.cinema_item_id,
    c.cinema_id,
    c.cinema_name,
    c.city,
    ci.item_id,
    ci.item_name,
    cat.category_name,
    ci.price as default_price,
    cci.cinema_price,
    COALESCE(cci.cinema_price, ci.price) as effective_price,
    cci.stock_quantity,
    cci.is_available as available_at_cinema,
    ci.is_available as item_active,
    cci.display_order,
    ci.image_url,
    ci.description,
    ci.size,
    cci.notes
FROM cinema_concession_items cci
JOIN cinemas c ON cci.cinema_id = c.cinema_id
JOIN concession_items ci ON cci.item_id = ci.item_id
JOIN concession_categories cat ON ci.category_id = cat.category_id
WHERE cci.is_available = 1 
  AND ci.is_available = 1
ORDER BY c.cinema_name, cat.display_order, cci.display_order, ci.item_name;

-- Verification queries
-- 1. Xem giá bắp nước tại từng rạp
SELECT cinema_name, item_name, 
       default_price, cinema_price, effective_price
FROM v_cinema_concession_prices
ORDER BY cinema_name, category_name, item_name;

-- 2. Kiểm tra items có giá khác nhau giữa các rạp
SELECT 
    ci.item_name,
    MIN(COALESCE(cci.cinema_price, ci.price)) as min_price,
    MAX(COALESCE(cci.cinema_price, ci.price)) as max_price,
    MAX(COALESCE(cci.cinema_price, ci.price)) - MIN(COALESCE(cci.cinema_price, ci.price)) as price_difference
FROM concession_items ci
LEFT JOIN cinema_concession_items cci ON ci.item_id = cci.item_id
WHERE ci.is_available = 1
GROUP BY ci.item_id, ci.item_name
HAVING price_difference > 0
ORDER BY price_difference DESC;

-- 3. Tồn kho thấp
SELECT cinema_name, item_name, stock_quantity
FROM v_cinema_concession_prices
WHERE stock_quantity < 20
ORDER BY stock_quantity;
