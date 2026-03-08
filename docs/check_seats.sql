-- ====================================================================
-- SCRIPT KIỂM TRA VÀ TẠO LẠI GHẾ CHO PHÒNG CHIẾU
-- ====================================================================

-- 1. KIỂM TRA TỔNG QUAN
-- ====================================================================

-- Kiểm tra tổng số ghế hiện tại
SELECT COUNT(*) as 'Tổng số ghế' FROM seats;

-- Kiểm tra số ghế theo từng phòng chiếu
SELECT 
    h.hall_id as 'ID Phòng',
    h.hall_name as 'Tên Phòng',
    c.cinema_name as 'Rạp',
    h.rows_count as 'Số Hàng',
    h.seats_per_row as 'Ghế/Hàng',
    h.total_seats as 'Tổng Ghế (Config)',
    COUNT(s.seat_id) as 'Ghế Thực Tế',
    CASE 
        WHEN COUNT(s.seat_id) = 0 THEN '❌ TRỐNG'
        WHEN COUNT(s.seat_id) = h.total_seats THEN '✅ ĐÚNG'
        ELSE '⚠️ SAI SỐ'
    END as 'Trạng Thái'
FROM cinema_halls h
LEFT JOIN cinemas c ON h.cinema_id = c.cinema_id
LEFT JOIN seats s ON h.hall_id = s.hall_id
GROUP BY h.hall_id
ORDER BY c.cinema_name, h.hall_name;

-- 2. PHÒNG CHIẾU CHƯA CÓ GHẾ
-- ====================================================================

SELECT 
    h.hall_id,
    h.hall_name,
    c.cinema_name,
    h.rows_count,
    h.seats_per_row,
    h.total_seats
FROM cinema_halls h
LEFT JOIN cinemas c ON h.cinema_id = c.cinema_id
LEFT JOIN seats s ON h.hall_id = s.hall_id
WHERE s.seat_id IS NULL
AND h.is_active = TRUE;

-- 3. XEM CHI TIẾT GHẾ CỦA 1 PHÒNG
-- ====================================================================

-- Thay {hall_id} bằng ID phòng chiếu bạn muốn xem
SELECT 
    seat_row as 'Hàng',
    seat_number as 'Số',
    seat_type as 'Loại',
    position_x as 'X',
    position_y as 'Y',
    is_active as 'Active'
FROM seats 
WHERE hall_id = 1  -- ⬅️ THAY ĐỔI ID Ở ĐÂY
ORDER BY seat_row, seat_number;

-- 4. THỐNG KÊ LOẠI GHẾ
-- ====================================================================

SELECT 
    h.hall_name as 'Phòng Chiếu',
    s.seat_type as 'Loại Ghế',
    COUNT(*) as 'Số Lượng'
FROM seats s
JOIN cinema_halls h ON s.hall_id = h.hall_id
GROUP BY h.hall_id, s.seat_type
ORDER BY h.hall_name, s.seat_type;

-- 5. KIỂM TRA GHẾ BỊ TRÙNG
-- ====================================================================

SELECT 
    hall_id,
    seat_row,
    seat_number,
    COUNT(*) as duplicates
FROM seats
GROUP BY hall_id, seat_row, seat_number
HAVING COUNT(*) > 1;

-- 6. XEM SƠ ĐỒ GHẾ (TEXT FORMAT)
-- ====================================================================

-- Xem sơ đồ ghế của phòng chiếu ID = 1
SELECT 
    CONCAT(seat_row, seat_number) as 'Ghế',
    CASE seat_type
        WHEN 'VIP' THEN '🟨'
        WHEN 'COUPLE' THEN '💑'
        WHEN 'WHEELCHAIR' THEN '♿'
        ELSE '⬜'
    END as 'Icon'
FROM seats
WHERE hall_id = 1  -- ⬅️ THAY ĐỔI ID Ở ĐÂY
ORDER BY seat_row, seat_number;

-- 7. THỐNG KÊ THEO RẠP
-- ====================================================================

SELECT 
    c.cinema_name as 'Rạp',
    COUNT(DISTINCT h.hall_id) as 'Số Phòng',
    SUM(h.total_seats) as 'Tổng Ghế (Config)',
    COUNT(s.seat_id) as 'Ghế Thực Tế',
    CASE 
        WHEN COUNT(s.seat_id) = 0 THEN '❌ CHƯA CÓ GHẾ'
        WHEN COUNT(s.seat_id) = SUM(h.total_seats) THEN '✅ HOÀN CHỈNH'
        ELSE '⚠️ THIẾU GHẾ'
    END as 'Trạng Thái'
FROM cinemas c
LEFT JOIN cinema_halls h ON c.cinema_id = h.cinema_id
LEFT JOIN seats s ON h.hall_id = s.hall_id
WHERE h.is_active = TRUE
GROUP BY c.cinema_id
ORDER BY c.cinema_name;

-- ====================================================================
-- CÁCH SỬ DỤNG API ĐỂ QUẢN LÝ GHẾ
-- ====================================================================

/*

====================
TẠO LẠI GHẾ (Regenerate)
====================

OPTION 1: Tạo lại ghế cho 1 phòng chiếu
-----------------------------------------
Method: POST
URL: http://localhost:8080/api/cinema-halls/admin/{hallId}/regenerate-seats
Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN

Ví dụ: 
POST http://localhost:8080/api/cinema-halls/admin/1/regenerate-seats


OPTION 2: Tạo lại ghế cho tất cả phòng chiếu của 1 rạp
-------------------------------------------------------
Method: POST
URL: http://localhost:8080/api/cinema-halls/admin/cinema/{cinemaId}/regenerate-seats
Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN

Ví dụ: 
POST http://localhost:8080/api/cinema-halls/admin/cinema/2/regenerate-seats


OPTION 3: Tạo phòng chiếu mới (tự động tạo ghế)
------------------------------------------------
Method: POST
URL: http://localhost:8080/api/cinema-halls/admin
Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN
  - Content-Type: application/json
Body:
{
  "cinemaId": 2,
  "hallName": "Phòng VIP 5",
  "totalSeats": 100,
  "rowsCount": 10,
  "seatsPerRow": 10,
  "screenType": "IMAX",
  "soundSystem": "Dolby Atmos"
}


====================
XÓA GHẾ (Delete)
====================

OPTION 4: Xóa tất cả ghế trong 1 phòng chiếu
---------------------------------------------
Method: DELETE
URL: http://localhost:8080/api/cinema-halls/admin/{hallId}/seats
Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN

Ví dụ: 
DELETE http://localhost:8080/api/cinema-halls/admin/1/seats

Response:
{
  "success": true,
  "message": "Xóa ghế thành công",
  "data": "Đã xóa 80 ghế khỏi phòng chiếu Phòng VIP 1"
}


OPTION 5: Xóa tất cả ghế trong tất cả phòng chiếu của 1 rạp
------------------------------------------------------------
Method: DELETE
URL: http://localhost:8080/api/cinema-halls/admin/cinema/{cinemaId}/seats
Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN

Ví dụ: 
DELETE http://localhost:8080/api/cinema-halls/admin/cinema/2/seats

Response:
{
  "success": true,
  "message": "Xóa ghế thành công",
  "data": "Đã xóa 320 ghế từ 4 phòng chiếu"
}

*/

-- ====================================================================
-- LƯU Ý QUAN TRỌNG
-- ====================================================================

/*
🔐 BẢO MẬT:
1. Tất cả API đều yêu cầu JWT token (phải đăng nhập)
2. Chỉ SYSTEM_ADMIN hoặc Cinema Manager mới có quyền

⚙️ LOGIC:
3. Khi REGENERATE: ghế cũ sẽ bị XÓA và tạo mới
4. Khi DELETE: chỉ xóa ghế, không tạo lại
5. Ghế được tạo tự động dựa trên: rowsCount × seatsPerRow
6. Hàng A, B mặc định là VIP, các hàng khác là STANDARD

⚠️ CẢNH BÁO:
7. Xóa ghế sẽ ảnh hưởng đến các BOOKING/RESERVATION đã có
8. Nên kiểm tra kỹ trước khi xóa ghế có showtime đang hoạt động
9. Sử dụng @Transactional nên có rollback nếu lỗi

💡 USE CASES:
- REGENERATE: Khi muốn thay đổi cấu hình ghế (số hàng, số ghế/hàng)
- DELETE: Khi muốn reset hoàn toàn hoặc tạm thời vô hiệu hóa ghế
- DELETE + REGENERATE: Cách an toàn để làm mới ghế
*/
