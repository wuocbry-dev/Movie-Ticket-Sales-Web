-- ================================================
-- Sample Data: Cinemas, Concessions, and Setup
-- ================================================

-- Step 1: Insert sample cinema chain (if not exists)
INSERT IGNORE INTO cinema_chains (chain_id, chain_name, description, created_at) 
VALUES (1, 'CGV Cinemas', 'Hệ thống rạp chiếu phim CGV', NOW());

-- Step 2: Insert sample cinemas
INSERT IGNORE INTO cinemas (cinema_id, cinema_name, chain_id, address, city, district, phone_number, email, is_active, created_at)
VALUES 
(1, 'CGV Vincom Center', 1, '72 Lê Thánh Tôn', 'Hồ Chí Minh', 'Quận 1', '0281234567', 'cgv.vincom@cgv.vn', TRUE, NOW()),
(2, 'CGV Aeon Mall', 1, '30 Bờ Bao Tân Thắng', 'Hồ Chí Minh', 'Tân Phú', '0287654321', 'cgv.aeon@cgv.vn', TRUE, NOW()),
(3, 'CGV Crescent Mall', 1, '101 Tôn Dật Tiên', 'Hồ Chí Minh', 'Quận 7', '0283456789', 'cgv.crescent@cgv.vn', TRUE, NOW());

-- Step 3: Insert concession categories
INSERT IGNORE INTO concession_categories (id, category_name, description, display_order, is_active, created_at)
VALUES
(1, 'Đồ ăn', 'Bắp rang, snack các loại', 1, TRUE, NOW()),
(2, 'Nước uống', 'Nước ngọt, nước ép', 2, TRUE, NOW()),
(3, 'Combo', 'Combo tiết kiệm', 3, TRUE, NOW());

-- Step 4: Insert concession items (master data)
INSERT IGNORE INTO concession_items (id, item_name, category_id, price, size, description, calories, is_combo, combo_items, available_cinemas, is_available, image_url, created_at)
VALUES
-- Đồ ăn
(1, 'Bắp rang bơ lớn', 1, 50000, 'L', 'Bắp rang bơ thơm ngon size lớn', 500, FALSE, '', '', TRUE, NULL, NOW()),
(2, 'Bắp rang bơ vừa', 1, 35000, 'M', 'Bắp rang bơ thơm ngon size vừa', 350, FALSE, '', '', TRUE, NULL, NOW()),
(3, 'Bắp rang bơ nhỏ', 1, 25000, 'S', 'Bắp rang bơ thơm ngon size nhỏ', 250, FALSE, '', '', TRUE, NULL, NOW()),
(4, 'Nachos phô mai', 1, 45000, 'M', 'Nachos giòn tan với phô mai', 400, FALSE, '', '', TRUE, NULL, NOW()),

-- Nước uống
(5, 'Coca Cola', 2, 30000, 'M', 'Nước ngọt Coca Cola', 200, FALSE, '', '', TRUE, NULL, NOW()),
(6, 'Pepsi', 2, 30000, 'M', 'Nước ngọt Pepsi', 200, FALSE, '', '', TRUE, NULL, NOW()),
(7, 'Sprite', 2, 30000, 'M', 'Nước ngọt Sprite', 180, FALSE, '', '', TRUE, NULL, NOW()),
(8, 'Nước cam ép', 2, 40000, 'M', 'Nước cam tươi ép', 150, FALSE, '', '', TRUE, NULL, NOW()),

-- Combo
(9, 'Combo Solo', 3, 70000, 'M', '1 Bắp vừa + 1 Nước ngọt', 550, TRUE, '1x Bắp rang bơ vừa, 1x Nước ngọt', '', TRUE, NULL, NOW()),
(10, 'Combo Couple', 3, 120000, 'L', '2 Bắp lớn + 2 Nước ngọt', 1000, TRUE, '2x Bắp rang bơ lớn, 2x Nước ngọt', '', TRUE, NULL, NOW()),
(11, 'Combo Family', 3, 200000, 'XL', '3 Bắp lớn + 4 Nước ngọt + 1 Nachos', 1800, TRUE, '3x Bắp rang bơ lớn, 4x Nước ngọt, 1x Nachos phô mai', '', TRUE, NULL, NOW());

-- Step 5: Link concession items to cinemas (cinema_concession_items)
-- Cinema 1 - All items
INSERT IGNORE INTO cinema_concession_items (cinema_id, item_id, cinema_price, stock_quantity, is_available, display_order, created_at)
VALUES
-- Cinema 1 - CGV Vincom Center
(1, 1, NULL, 100, TRUE, 1, NOW()),  -- Bắp lớn
(1, 2, NULL, 150, TRUE, 2, NOW()),  -- Bắp vừa
(1, 3, NULL, 200, TRUE, 3, NOW()),  -- Bắp nhỏ
(1, 4, NULL, 80, TRUE, 4, NOW()),   -- Nachos
(1, 5, NULL, 200, TRUE, 5, NOW()),  -- Coca
(1, 6, NULL, 200, TRUE, 6, NOW()),  -- Pepsi
(1, 7, NULL, 200, TRUE, 7, NOW()),  -- Sprite
(1, 8, NULL, 100, TRUE, 8, NOW()),  -- Cam ép
(1, 9, NULL, 50, TRUE, 9, NOW()),   -- Combo Solo
(1, 10, NULL, 50, TRUE, 10, NOW()), -- Combo Couple
(1, 11, NULL, 30, TRUE, 11, NOW()), -- Combo Family

-- Cinema 2 - CGV Aeon Mall (với giá custom)
(2, 1, 55000, 100, TRUE, 1, NOW()),  -- Bắp lớn - giá cao hơn
(2, 2, 38000, 150, TRUE, 2, NOW()),  -- Bắp vừa
(2, 5, 32000, 200, TRUE, 3, NOW()),  -- Coca
(2, 6, 32000, 200, TRUE, 4, NOW()),  -- Pepsi
(2, 9, 75000, 50, TRUE, 5, NOW()),   -- Combo Solo
(2, 10, 130000, 50, TRUE, 6, NOW()), -- Combo Couple

-- Cinema 3 - CGV Crescent Mall (ít items hơn)
(3, 1, NULL, 80, TRUE, 1, NOW()),    -- Bắp lớn
(3, 2, NULL, 120, TRUE, 2, NOW()),   -- Bắp vừa
(3, 5, NULL, 150, TRUE, 3, NOW()),   -- Coca
(3, 9, NULL, 40, TRUE, 4, NOW()),    -- Combo Solo
(3, 10, NULL, 40, TRUE, 5, NOW());   -- Combo Couple

-- ================================================
-- Verification Queries
-- ================================================
-- SELECT * FROM cinemas;
-- SELECT * FROM concession_categories;
-- SELECT * FROM concession_items;
-- SELECT * FROM cinema_concession_items;

-- ================================================
-- Test API Queries After Running This Script
-- ================================================
-- GET http://localhost:8080/api/cinemas
-- GET http://localhost:8080/api/concessions/categories
-- GET http://localhost:8080/api/concessions/items
-- GET http://localhost:8080/api/cinemas/1/concessions
-- GET http://localhost:8080/api/cinemas/2/concessions
-- GET http://localhost:8080/api/cinemas/3/concessions

COMMIT;
