# 🎬 API Documentation - Showtime Management

## 📋 Tổng Quan

API quản lý **suất chiếu phim** (showtimes) với đầy đủ chức năng CRUD và phân quyền.

---

## 🔗 Endpoints

### 🟢 Public Endpoints (Không cần token)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/showtimes` | Lấy danh sách tất cả suất chiếu (phân trang) |
| GET | `/api/showtimes/{showtimeId}` | Xem chi tiết 1 suất chiếu |
| GET | `/api/showtimes/movie/{movieId}` | Xem suất chiếu theo phim |

### 🟡 Admin Endpoints (Cần JWT token)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/showtimes/admin` | Tạo suất chiếu mới |
| PUT | `/api/showtimes/admin/{showtimeId}` | Cập nhật suất chiếu |
| DELETE | `/api/showtimes/admin/{showtimeId}` | Xóa suất chiếu |

---

## 📝 Request/Response Models

### ShowtimeDto (Response)

```json
{
  "showtimeId": 1,
  "movieId": 5,
  "movieTitle": "Avatar: The Way of Water",
  "moviePosterUrl": "https://image.tmdb.org/t/p/w500/avatar.jpg",
  "hallId": 3,
  "hallName": "Phòng VIP 1",
  "cinemaId": 2,
  "cinemaName": "CGV Vincom Center",
  "showDate": "2025-12-10",
  "startTime": "19:30:00",
  "endTime": "22:00:00",
  "formatType": "_3D",
  "subtitleLanguage": "Vietsub",
  "status": "SELLING",
  "availableSeats": 80,
  "basePrice": 150000.00,
  "createdAt": "2025-12-05T10:00:00Z",
  "updatedAt": "2025-12-05T10:00:00Z"
}
```

### CreateShowtimeRequest

```json
{
  "movieId": 5,
  "hallId": 3,
  "showDate": "2025-12-10",
  "startTime": "19:30:00",
  "endTime": "22:00:00",
  "formatType": "_3D",
  "subtitleLanguage": "Vietsub",
  "basePrice": 150000.00
}
```

### UpdateShowtimeRequest

```json
{
  "showtimeId": 1,
  "movieId": 5,
  "hallId": 3,
  "showDate": "2025-12-10",
  "startTime": "20:00:00",
  "endTime": "22:30:00",
  "formatType": "_3D",
  "subtitleLanguage": "Vietsub",
  "status": "SELLING",
  "basePrice": 180000.00
}
```

---

## 🎯 Chi Tiết API Endpoints

### 1. Lấy Danh Sách Suất Chiếu (Phân Trang)

**Endpoint:** `GET /api/showtimes`

**Parameters:**
- `page` (optional, default: 0) - Số trang
- `size` (optional, default: 10) - Số items/trang

**Example:**
```bash
curl -X GET "http://localhost:8080/api/showtimes?page=0&size=10"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu thành công",
  "data": {
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false,
    "data": [
      {
        "showtimeId": 1,
        "movieTitle": "Avatar 2",
        "cinemaName": "CGV Vincom",
        ...
      }
    ]
  }
}
```

---

### 2. Xem Suất Chiếu Theo Phim

**Endpoint:** `GET /api/showtimes/movie/{movieId}`

**Example:**
```bash
curl -X GET "http://localhost:8080/api/showtimes/movie/5"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu thành công",
  "data": [
    {
      "showtimeId": 1,
      "movieId": 5,
      "showDate": "2025-12-10",
      "startTime": "19:30:00",
      ...
    },
    {
      "showtimeId": 2,
      "movieId": 5,
      "showDate": "2025-12-10",
      "startTime": "22:00:00",
      ...
    }
  ]
}
```

---

### 3. Xem Chi Tiết Suất Chiếu

**Endpoint:** `GET /api/showtimes/{showtimeId}`

**Example:**
```bash
curl -X GET "http://localhost:8080/api/showtimes/1"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin suất chiếu thành công",
  "data": {
    "showtimeId": 1,
    "movieTitle": "Avatar 2",
    "hallName": "Phòng VIP 1",
    "cinemaName": "CGV Vincom",
    "showDate": "2025-12-10",
    "startTime": "19:30:00",
    "endTime": "22:00:00",
    "availableSeats": 80,
    "basePrice": 150000.00
  }
}
```

---

### 4. Tạo Suất Chiếu Mới (Admin)

**Endpoint:** `POST /api/showtimes/admin`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "movieId": 5,
  "hallId": 3,
  "showDate": "2025-12-10",
  "startTime": "19:30:00",
  "endTime": "22:00:00",
  "formatType": "_3D",
  "subtitleLanguage": "Vietsub",
  "basePrice": 150000.00
}
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/showtimes/admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 5,
    "hallId": 3,
    "showDate": "2025-12-10",
    "startTime": "19:30:00",
    "endTime": "22:00:00",
    "formatType": "_3D",
    "subtitleLanguage": "Vietsub",
    "basePrice": 150000.00
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo suất chiếu thành công",
  "data": {
    "showtimeId": 25,
    "movieId": 5,
    "movieTitle": "Avatar 2",
    "hallId": 3,
    "hallName": "Phòng VIP 1",
    "showDate": "2025-12-10",
    "startTime": "19:30:00",
    "endTime": "22:00:00",
    "formatType": "_3D",
    "status": "SCHEDULED",
    "availableSeats": 80,
    "basePrice": 150000.00
  }
}
```

---

### 5. Cập Nhật Suất Chiếu (Admin)

**Endpoint:** `PUT /api/showtimes/admin/{showtimeId}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "showDate": "2025-12-11",
  "startTime": "20:00:00",
  "endTime": "22:30:00",
  "status": "SELLING",
  "basePrice": 180000.00
}
```

**Example:**
```bash
curl -X PUT "http://localhost:8080/api/showtimes/admin/25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showDate": "2025-12-11",
    "startTime": "20:00:00",
    "status": "SELLING",
    "basePrice": 180000.00
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật suất chiếu thành công",
  "data": {
    "showtimeId": 25,
    "showDate": "2025-12-11",
    "startTime": "20:00:00",
    "status": "SELLING",
    "basePrice": 180000.00,
    "updatedAt": "2025-12-05T11:30:00Z"
  }
}
```

---

### 6. Xóa Suất Chiếu (Admin)

**Endpoint:** `DELETE /api/showtimes/admin/{showtimeId}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:**
```bash
curl -X DELETE "http://localhost:8080/api/showtimes/admin/25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa suất chiếu thành công"
}
```

---

## 📊 Enums

### FormatType

```
_2D       - Phim 2D (mặc định)
_3D       - Phim 3D
IMAX      - Định dạng IMAX
_4DX      - Định dạng 4DX
SCREENX   - Định dạng ScreenX
```

### ShowtimeStatus

```
SCHEDULED - Đã lên lịch (mặc định khi tạo mới)
SELLING   - Đang bán vé
SOLD_OUT  - Đã bán hết
CANCELLED - Đã hủy
```

---

## 🔐 Authorization

### Public Access (Không cần token):
- Xem danh sách suất chiếu
- Xem chi tiết suất chiếu
- Xem suất chiếu theo phim

### Authenticated Access (Cần JWT token):
- **SYSTEM_ADMIN**: Full access tất cả rạp
- **Cinema Manager**: Chỉ quản lý suất chiếu của rạp mình quản lý

### Lấy JWT Token:

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## ⚠️ Validation Rules

### Khi Tạo Suất Chiếu:

1. **Movie phải tồn tại** - Kiểm tra `movieId`
2. **Hall phải tồn tại** - Kiểm tra `hallId`
3. **Thời gian hợp lệ** - `endTime` phải sau `startTime`
4. **Quyền truy cập** - User phải là Admin hoặc Manager của rạp
5. **Giá vé** - `basePrice` phải > 0

### Khi Cập Nhật:

- Các field `null` sẽ không được cập nhật (giữ nguyên giá trị cũ)
- Nếu đổi `hallId` → Tự động cập nhật `availableSeats` từ hall mới
- Không thể cập nhật suất chiếu của rạp khác nếu không có quyền

---

## 🎯 Use Cases

### 1. Tạo Lịch Chiếu Cho Phim Mới

```bash
# Tạo nhiều suất chiếu cho cùng 1 phim
curl -X POST "http://localhost:8080/api/showtimes/admin" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 5,
    "hallId": 1,
    "showDate": "2025-12-10",
    "startTime": "10:00:00",
    "endTime": "12:30:00",
    "formatType": "_2D",
    "basePrice": 100000
  }'

curl -X POST "http://localhost:8080/api/showtimes/admin" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 5,
    "hallId": 2,
    "showDate": "2025-12-10",
    "startTime": "14:00:00",
    "endTime": "16:30:00",
    "formatType": "_3D",
    "basePrice": 150000
  }'
```

### 2. Mở Bán Vé (Đổi Status)

```bash
curl -X PUT "http://localhost:8080/api/showtimes/admin/25" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SELLING"
  }'
```

### 3. Đánh Dấu Sold Out

```bash
curl -X PUT "http://localhost:8080/api/showtimes/admin/25" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SOLD_OUT"
  }'
```

### 4. Hủy Suất Chiếu

```bash
curl -X PUT "http://localhost:8080/api/showtimes/admin/25" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED"
  }'
```

---

## 🛠️ Logic Nghiệp Vụ

### Tự Động Set Available Seats:

Khi tạo showtime mới, hệ thống tự động:
1. Đếm số ghế trong phòng chiếu (`hallId`)
2. Gán vào field `availableSeats`

```java
long seatCount = seatRepository.countByHallId(hallId);
showtime.setAvailableSeats((int) seatCount);
```

### Status Lifecycle:

```
SCHEDULED → SELLING → SOLD_OUT
     ↓
CANCELLED
```

- **SCHEDULED**: Vừa tạo, chưa mở bán
- **SELLING**: Đang bán vé
- **SOLD_OUT**: Hết vé
- **CANCELLED**: Admin hủy

---

## 📝 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Phim không tồn tại"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Bạn không có quyền tạo suất chiếu cho rạp này"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Suất chiếu không tồn tại"
}
```

---

## 🧪 Testing

### Postman Collection

Tạo collection với các request sau:

1. **Get All Showtimes** - GET `/api/showtimes`
2. **Get Showtime By ID** - GET `/api/showtimes/1`
3. **Get Showtimes By Movie** - GET `/api/showtimes/movie/5`
4. **Create Showtime** - POST `/api/showtimes/admin`
5. **Update Showtime** - PUT `/api/showtimes/admin/1`
6. **Delete Showtime** - DELETE `/api/showtimes/admin/1`

### Environment Variables

```
base_url: http://localhost:8080
jwt_token: (lấy từ login response)
```

---

## 🔍 SQL Queries Hữu Ích

```sql
-- Xem tất cả suất chiếu
SELECT 
    s.showtime_id,
    m.title as movie_title,
    h.hall_name,
    c.cinema_name,
    s.show_date,
    s.start_time,
    s.status,
    s.available_seats,
    s.base_price
FROM showtimes s
JOIN movies m ON s.movie_id = m.movie_id
JOIN cinema_halls h ON s.hall_id = h.hall_id
JOIN cinemas c ON h.cinema_id = c.cinema_id
ORDER BY s.show_date DESC, s.start_time ASC;

-- Suất chiếu theo phim
SELECT * FROM showtimes WHERE movie_id = 5;

-- Suất chiếu đang bán vé
SELECT * FROM showtimes WHERE status = 'SELLING';

-- Suất chiếu ngày mai
SELECT * FROM showtimes WHERE show_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY);
```

---

**Last Updated:** December 5, 2025  
**Version:** 1.0  
**Author:** Movie Ticket Sales System
