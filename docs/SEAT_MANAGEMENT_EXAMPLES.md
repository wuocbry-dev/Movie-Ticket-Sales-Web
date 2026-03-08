# 🎭 Ví Dụ Thực Tế: Quản Lý Ghế Phòng Chiếu

## 📖 Các Tình Huống Sử Dụng

### Tình Huống 1: Xóa và Tạo Lại Ghế Cho 1 Phòng

**Kịch bản:** Phòng VIP 1 (ID: 1) cần thay đổi từ 8x10 sang 10x12 ghế

```bash
# Bước 1: Xóa tất cả ghế cũ
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/1/seats" \
  -H "Authorization: Bearer eyJhbGci..."

# Response:
# {
#   "success": true,
#   "message": "Xóa ghế thành công",
#   "data": "Đã xóa 80 ghế khỏi phòng chiếu Phòng VIP 1"
# }

# Bước 2: Cập nhật cấu hình phòng (tự động tạo ghế mới)
curl -X PUT "http://localhost:8080/api/cinema-halls/admin/1" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "hallId": 1,
    "cinemaId": 2,
    "rowsCount": 10,
    "seatsPerRow": 12
  }'

# Response:
# {
#   "success": true,
#   "message": "Cập nhật phòng chiếu thành công",
#   "data": { ... } // Hall với 120 ghế mới
# }
```

**Kết quả:** Phòng VIP 1 giờ có 120 ghế (10 hàng x 12 ghế)

---

### Tình Huống 2: Reset Tất Cả Ghế Trong Rạp

**Kịch bản:** Rạp ABC (ID: 2) cần làm mới toàn bộ ghế của 4 phòng chiếu

```bash
# Cách 1: Xóa tất cả ghế trước
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/cinema/2/seats" \
  -H "Authorization: Bearer eyJhbGci..."

# Response:
# {
#   "success": true,
#   "message": "Xóa ghế thành công",
#   "data": "Đã xóa 320 ghế từ 4 phòng chiếu"
# }

# Cách 2: Tạo lại tất cả ghế (không cần xóa trước)
curl -X POST "http://localhost:8080/api/cinema-halls/admin/cinema/2/regenerate-seats" \
  -H "Authorization: Bearer eyJhbGci..."

# Response:
# {
#   "success": true,
#   "message": "Tạo lại ghế thành công",
#   "data": "Đã tạo 320 ghế cho 4 phòng chiếu"
# }
```

**Kết quả:** Tất cả 4 phòng chiếu có ghế mới

---

### Tình Huống 3: Tạo Phòng Mới Với Ghế Tùy Chỉnh

**Kịch bản:** Tạo phòng IMAX mới với ghế VIP và Couple

```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "cinemaId": 2,
    "hallName": "IMAX Premium",
    "totalSeats": 100,
    "rowsCount": 10,
    "seatsPerRow": 10,
    "screenType": "IMAX Laser",
    "soundSystem": "Dolby Atmos",
    "seatLayout": {
      "A1": "VIP",
      "A2": "VIP",
      "A3": "VIP",
      "A4": "VIP",
      "A5": "VIP",
      "J1": "COUPLE",
      "J2": "COUPLE",
      "J9": "COUPLE",
      "J10": "COUPLE"
    }
  }'

# Response:
# {
#   "success": true,
#   "message": "Tạo phòng chiếu thành công",
#   "data": {
#     "hallId": 5,
#     "hallName": "IMAX Premium",
#     "totalSeats": 100,
#     ...
#   }
# }
```

**Kết quả:** 
- Phòng IMAX Premium được tạo với ID: 5
- 100 ghế tự động được sinh:
  - Hàng A (1-5): VIP
  - Hàng J (1,2,9,10): COUPLE
  - Còn lại: STANDARD

---

### Tình Huống 4: Kiểm Tra Ghế Sau Khi Tạo

```sql
-- Kiểm tra tổng quan
SELECT 
    h.hall_name,
    COUNT(s.seat_id) as actual_seats,
    h.total_seats as configured_seats,
    CASE 
        WHEN COUNT(s.seat_id) = h.total_seats THEN '✅'
        ELSE '❌'
    END as status
FROM cinema_halls h
LEFT JOIN seats s ON h.hall_id = s.hall_id
WHERE h.hall_id = 5
GROUP BY h.hall_id;

-- Xem chi tiết loại ghế
SELECT 
    seat_type,
    COUNT(*) as count,
    GROUP_CONCAT(CONCAT(seat_row, seat_number) ORDER BY seat_row, seat_number) as seats
FROM seats
WHERE hall_id = 5
GROUP BY seat_type;
```

**Kết quả mẫu:**
```
+---------------+--------------+------------------+--------+
| hall_name     | actual_seats | configured_seats | status |
+---------------+--------------+------------------+--------+
| IMAX Premium  | 100          | 100              | ✅     |
+---------------+--------------+------------------+--------+

+-----------+-------+------------------+
| seat_type | count | seats            |
+-----------+-------+------------------+
| VIP       | 15    | A1,A2,...,B10   |
| COUPLE    | 4     | J1,J2,J9,J10    |
| STANDARD  | 81    | C1,C2,...,I10   |
+-----------+-------+------------------+
```

---

### Tình Huống 5: Xóa Ghế Phòng Không Còn Sử Dụng

**Kịch bản:** Phòng cũ cần tạm ngưng hoạt động

```bash
# Xóa ghế
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/3/seats" \
  -H "Authorization: Bearer eyJhbGci..."

# Vô hiệu hóa phòng
curl -X PUT "http://localhost:8080/api/cinema-halls/admin/3" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "hallId": 3,
    "cinemaId": 2,
    "isActive": false
  }'
```

---

## 🔄 So Sánh DELETE vs REGENERATE

| Tính Năng | DELETE | REGENERATE |
|-----------|--------|------------|
| **Xóa ghế cũ** | ✅ | ✅ |
| **Tạo ghế mới** | ❌ | ✅ |
| **Use case** | Reset hoàn toàn | Thay đổi cấu hình |
| **API calls cần** | 1 | 1 |
| **Rollback nếu lỗi** | ✅ | ✅ |

---

## ⚠️ Lưu Ý An Toàn

### ❌ KHÔNG nên xóa ghế khi:
1. Có showtime đang hoạt động
2. Có booking/reservation chưa hoàn thành
3. Đang trong giờ cao điểm bán vé

### ✅ NÊN xóa ghế khi:
1. Phòng chiếu đang bảo trì
2. Muốn thay đổi cấu hình ghế hoàn toàn
3. Reset dữ liệu test/development

### 🔒 Kiểm tra trước khi xóa:

```sql
-- Kiểm tra showtime đang hoạt động
SELECT 
    s.showtime_id,
    m.title,
    s.start_time,
    s.hall_id
FROM showtimes s
JOIN movies m ON s.movie_id = m.movie_id
WHERE s.hall_id = 1  -- Thay ID phòng cần kiểm tra
AND s.start_time > NOW()
AND s.is_active = TRUE;

-- Kiểm tra booking chưa hoàn thành
SELECT 
    b.booking_id,
    b.status,
    COUNT(bs.seat_id) as seats_count
FROM bookings b
JOIN booking_seats bs ON b.booking_id = bs.booking_id
WHERE bs.seat_id IN (
    SELECT seat_id FROM seats WHERE hall_id = 1
)
AND b.status IN ('PENDING', 'CONFIRMED')
GROUP BY b.booking_id;
```

---

## 📊 Workflow Đề Xuất

### Workflow 1: Thay Đổi Cấu Hình Ghế
```
1. Kiểm tra showtime/booking ✓
2. Cập nhật phòng (với rowsCount/seatsPerRow mới) ✓
   → Tự động xóa và tạo lại ghế
3. Kiểm tra kết quả ✓
```

### Workflow 2: Reset Hoàn Toàn
```
1. Kiểm tra showtime/booking ✓
2. Xóa tất cả ghế (DELETE API) ✓
3. Tạo lại ghế (REGENERATE API) ✓
4. Kiểm tra kết quả ✓
```

### Workflow 3: Tạo Phòng Mới
```
1. Tạo phòng với config đầy đủ (POST API) ✓
   → Tự động tạo ghế
2. Kiểm tra kết quả ✓
3. Không cần xử lý thêm ✓
```

---

## 🎯 Best Practices

1. **Luôn backup trước khi xóa hàng loạt**
   ```sql
   CREATE TABLE seats_backup_20251205 AS SELECT * FROM seats;
   ```

2. **Test trên development trước**
   - Tạo phòng test
   - Thử các API
   - Xác nhận kết quả

3. **Log mọi thao tác quan trọng**
   - Application logs tự động ghi lại
   - Có thể trace lại user nào đã thực hiện

4. **Sử dụng transaction**
   - Code đã implement `@Transactional`
   - Tự động rollback nếu lỗi

5. **Kiểm tra authorization**
   - Chỉ ADMIN/Manager có quyền
   - JWT token bắt buộc

---

## 📞 Troubleshooting

### Lỗi: "Token không hợp lệ"
```bash
# Đăng nhập lại để lấy token mới
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Lỗi: "Bạn không có quyền"
- Kiểm tra user có role SYSTEM_ADMIN hoặc là Manager của rạp
- Xem query trong `setup_admin_role.sql`

### Lỗi: "Phòng chiếu không có ghế nào để xóa"
- Bình thường, bảng seats đã trống
- Có thể bỏ qua và tạo mới

### Ghế không tạo đúng số lượng
- Kiểm tra `rowsCount` và `seatsPerRow` có giá trị hợp lệ
- Xem logs application để debug
