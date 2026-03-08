# 🪑 Hướng Dẫn Tạo Ghế Tự Động cho Phòng Chiếu

## ❓ Vấn Đề: Bảng `seats` Trống

Nếu bạn thấy bảng `seats` không có dữ liệu, có 2 nguyên nhân:

1. **Cinema halls đã được tạo TRƯỚC khi triển khai tính năng tự động sinh ghế**
2. **Application chưa được khởi động lại** sau khi cập nhật code

---

## ✅ Giải Pháp

### 1️⃣ Khởi Động Lại Application

```powershell
# Dừng application hiện tại (Ctrl+C nếu đang chạy)
# Sau đó build và chạy lại:
cd "d:\git\Movie-Ticket-Sales-Web-Project\BE\Movie Ticket Sales Web Project"
.\build.ps1
.\run.ps1
```

### 2️⃣ Tạo Lại Ghế Cho Phòng Chiếu Cũ

Sử dụng các API endpoints mới để tạo lại ghế:

#### 🔹 Tạo Lại Ghế Cho 1 Phòng Chiếu

```http
POST http://localhost:8080/api/cinema-halls/admin/{hallId}/regenerate-seats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ví dụ với Postman/Curl:**

```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin/1/regenerate-seats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Tạo lại ghế thành công",
  "data": "Đã tạo 80 ghế cho phòng chiếu Phòng VIP 1"
}
```

#### 🔹 Tạo Lại Ghế Cho TẤT CẢ Phòng Chiếu trong 1 Rạp

```http
POST http://localhost:8080/api/cinema-halls/admin/cinema/{cinemaId}/regenerate-seats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ví dụ:**

```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin/cinema/2/regenerate-seats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Tạo lại ghế thành công",
  "data": "Đã tạo 320 ghế cho 4 phòng chiếu"
}
```

---

## 🗑️ Xóa Ghế

### Xóa Tất Cả Ghế trong 1 Phòng Chiếu

```http
DELETE http://localhost:8080/api/cinema-halls/admin/{hallId}/seats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ví dụ:**

```bash
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/1/seats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Xóa ghế thành công",
  "data": "Đã xóa 80 ghế khỏi phòng chiếu Phòng VIP 1"
}
```

### Xóa Tất Cả Ghế trong Tất Cả Phòng Chiếu của 1 Rạp

```http
DELETE http://localhost:8080/api/cinema-halls/admin/cinema/{cinemaId}/seats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ví dụ:**

```bash
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/cinema/2/seats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Xóa ghế thành công",
  "data": "Đã xóa 320 ghế từ 4 phòng chiếu"
}
```

---

## 🎯 Tính Năng Tự Động Sinh Ghế

### Khi Tạo Phòng Chiếu Mới

```http
POST http://localhost:8080/api/cinema-halls/admin
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "cinemaId": 2,
  "hallName": "Phòng VIP 3",
  "totalSeats": 80,
  "rowsCount": 8,
  "seatsPerRow": 10,
  "screenType": "Laser 4K",
  "soundSystem": "Dolby Atmos",
  "seatLayout": {
    "A1": "VIP",
    "A2": "VIP",
    "B5": "standard"
  }
}
```

**→ Tự động tạo 80 ghế (8 hàng × 10 ghế/hàng)**

### Khi Cập Nhật Phòng Chiếu

Nếu bạn thay đổi `rowsCount`, `seatsPerRow`, hoặc `seatLayout`, hệ thống sẽ **tự động xóa ghế cũ và tạo ghế mới**.

```http
PUT http://localhost:8080/api/cinema-halls/admin/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "cinemaId": 2,
  "hallId": 1,
  "rowsCount": 10,
  "seatsPerRow": 12
}
```

**→ Xóa 80 ghế cũ, tạo 120 ghế mới (10 hàng × 12 ghế/hàng)**

---

## 📊 Logic Phân Loại Ghế

### Quy Tắc Mặc Định:
- **Hàng A, B**: Ghế VIP
- **Các hàng còn lại**: Ghế STANDARD

### Tùy Chỉnh với `seatLayout`:

```json
{
  "seatLayout": {
    "A1": "VIP",
    "A2": "VIP",
    "C5": "COUPLE",
    "D10": "WHEELCHAIR",
    "E1": "standard"
  }
}
```

**Các loại ghế hỗ trợ:**
- `STANDARD` - Ghế thường
- `VIP` / `PREMIUM` - Ghế VIP
- `COUPLE` - Ghế đôi
- `WHEELCHAIR` - Ghế cho người khuyết tật

---

## 🔍 Kiểm Tra Kết Quả

### SQL Query để kiểm tra:

```sql
-- Kiểm tra tổng số ghế
SELECT COUNT(*) as total_seats FROM seats;

-- Kiểm tra ghế theo phòng chiếu
SELECT 
    h.hall_name,
    COUNT(s.seat_id) as total_seats,
    h.rows_count,
    h.seats_per_row
FROM cinema_halls h
LEFT JOIN seats s ON h.hall_id = s.hall_id
GROUP BY h.hall_id;

-- Xem chi tiết ghế của 1 phòng
SELECT 
    seat_row, 
    seat_number, 
    seat_type 
FROM seats 
WHERE hall_id = 1 
ORDER BY seat_row, seat_number;
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ Yêu Cầu Bắt Buộc:
- Phải có `rowsCount` và `seatsPerRow` trong cinema hall
- Cả 2 giá trị phải > 0
- Phải có quyền **SYSTEM_ADMIN** hoặc là **Cinema Manager**

### 🔒 Bảo Mật:
- Tất cả API đều yêu cầu **JWT token**
- Chỉ Admin/Manager mới có quyền tạo/cập nhật ghế

### 📝 Transaction:
- Tất cả thao tác đều sử dụng `@Transactional`
- Nếu có lỗi, toàn bộ thao tác sẽ bị rollback

---

## 📋 Tóm Tắt Các API Endpoints

| Chức Năng | Method | Endpoint | Mô Tả |
|-----------|--------|----------|-------|
| **Tạo lại ghế cho 1 phòng** | POST | `/api/cinema-halls/admin/{hallId}/regenerate-seats` | Xóa ghế cũ và tạo mới |
| **Tạo lại ghế cho tất cả phòng** | POST | `/api/cinema-halls/admin/cinema/{cinemaId}/regenerate-seats` | Xóa và tạo lại tất cả ghế trong rạp |
| **Xóa ghế của 1 phòng** | DELETE | `/api/cinema-halls/admin/{hallId}/seats` | Xóa tất cả ghế trong 1 phòng |
| **Xóa ghế của tất cả phòng** | DELETE | `/api/cinema-halls/admin/cinema/{cinemaId}/seats` | Xóa tất cả ghế trong rạp |
| **Tạo phòng mới** | POST | `/api/cinema-halls/admin` | Tự động tạo ghế khi tạo phòng |
| **Cập nhật phòng** | PUT | `/api/cinema-halls/admin/{hallId}` | Tự động tạo lại ghế nếu thay đổi config |

---

## 🚀 Test API với Postman

### Bước 1: Đăng nhập để lấy token

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Bước 2: Copy JWT token từ response

### Bước 3: Gọi API regenerate seats

```http
POST http://localhost:8080/api/cinema-halls/admin/cinema/2/regenerate-seats
Authorization: Bearer {PASTE_TOKEN_HERE}
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs application
2. Kiểm tra database connection
3. Xác nhận JWT token còn hợp lệ
4. Xác nhận user có quyền phù hợp

## 🎉 Kết Quả Mong Đợi

Sau khi chạy regenerate seats thành công:
- ✅ Bảng `seats` có dữ liệu
- ✅ Mỗi phòng chiếu có đủ số ghế theo `rowsCount × seatsPerRow`
- ✅ Ghế được phân loại đúng theo `seatLayout`
- ✅ Ghế có vị trí (position_x, position_y) để hiển thị UI
