# Hướng Dẫn Test Trang Profile

## Cách Test Trang Thông Tin Cá Nhân

### Bước 1: Đăng nhập
1. Mở trình duyệt và vào `http://localhost:3000`
2. Click vào nút "Đăng nhập" ở header
3. Nhập thông tin đăng nhập hoặc đăng ký tài khoản mới

### Bước 2: Vào trang Profile
1. Sau khi đăng nhập, click vào tên của bạn ở header
2. Trong dropdown menu, chọn "Thông tin cá nhân"
3. Hoặc truy cập trực tiếp: `http://localhost:3000/profile`

### Bước 3: Kiểm tra Console
Mở Developer Tools (F12) và kiểm tra Console để xem:
- `Stored user from localStorage:` - Thông tin user từ localStorage
- `Parsed user data:` - Dữ liệu đã parse
- `Access token:` - Trạng thái token
- `Fetching profile from API...` - Khi call API
- `API Response:` hoặc `API Error:` - Kết quả từ API

## Các Trường Hợp Test

### ✅ Trường hợp 1: Đã đăng nhập, có data trong localStorage
**Kết quả mong đợi:**
- Trang hiển thị thông tin từ localStorage ngay lập tức
- Toast thông báo: "Hiển thị thông tin từ bộ nhớ cache" (nếu không có token)
- Hoặc "Thông tin đã được cập nhật" (nếu API thành công)

### ⚠️ Trường hợp 2: Đã đăng nhập, API chưa sẵn sàng
**Kết quả mong đợi:**
- Trang vẫn hiển thị thông tin từ localStorage
- Toast cảnh báo: "Không thể kết nối server. Hiển thị thông tin đã lưu."
- Console log: `API Error: ...`

### ❌ Trường hợp 3: Chưa đăng nhập
**Kết quả mong đợi:**
- Redirect về trang `/login`
- Toast lỗi: "Vui lòng đăng nhập để xem thông tin"

## Kiểm Tra Dữ Liệu

### Xem localStorage:
```javascript
// Paste vào Console của browser
console.log('User data:', localStorage.getItem('user'));
console.log('Parsed:', JSON.parse(localStorage.getItem('user')));
```

### Xem Cookies:
```javascript
// Paste vào Console của browser
console.log('Access Token:', document.cookie);
```

## Sửa Lỗi Thường Gặp

### Lỗi: "Không thể tải thông tin cá nhân"
**Nguyên nhân:**
- Backend chưa implement endpoint `/users/profile`
- Token hết hạn
- CORS issues

**Giải pháp:**
1. Kiểm tra Console để xem lỗi cụ thể
2. Nếu API chưa có, trang sẽ dùng data từ localStorage
3. Nếu token hết hạn, đăng nhập lại

### Lỗi: Trang trống hoặc loading mãi
**Nguyên nhân:**
- localStorage không có dữ liệu
- Cookies bị xóa

**Giải pháp:**
1. Xóa localStorage và cookies
2. Đăng nhập lại
```javascript
// Paste vào Console
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

## Tính Năng Đã Implement

### ✅ Profile Page (`/profile`)
- Hiển thị avatar
- Thông tin membership (hạng, mã TV)
- Thông tin chi tiết: Tên, Email, SĐT, Ngày sinh, Giới tính
- Badge xác thực email
- Chức năng chỉnh sửa thông tin
- Button "Lịch Sử Đặt Vé"

### ✅ Booking History (`/bookings`)
- Bộ lọc: Tất cả, Sắp chiếu, Đã xem, Đã hủy
- Danh sách booking cards
- Thông tin chi tiết từng vé
- Nút xem chi tiết và hủy vé
- Empty state khi chưa có vé

## API Endpoints Cần Từ Backend

### 1. GET /users/profile
**Request:**
```
Headers: { Authorization: "Bearer <token>" }
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "isEmailVerified": true,
    "membershipNumber": "MB123456",
    "tierName": "Gold",
    "availablePoints": 500
  }
}
```

### 2. PUT /users/profile
**Request:**
```
Headers: { Authorization: "Bearer <token>" }
Body: {
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE"
}
```

### 3. GET /users/bookings
**Response mong đợi:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "bookingCode": "BK123456",
      "movieTitle": "Avengers",
      "moviePoster": "url",
      "status": "CONFIRMED",
      "showtimeDate": "2025-10-20T19:00:00",
      "cinemaName": "CGV Vincom",
      "roomName": "Room 1",
      "seats": ["A1", "A2"],
      "totalAmount": 200000
    }
  ]
}
```

## Debug Tips

1. **Luôn mở Console khi test**
2. **Kiểm tra Network tab** để xem API calls
3. **Kiểm tra Application > Local Storage** để xem dữ liệu lưu
4. **Kiểm tra Application > Cookies** để xem tokens

## Tóm Tắt

Hiện tại trang Profile đã hoạt động với **fallback mechanism**:
1. ✅ Ưu tiên lấy data từ localStorage (nhanh, luôn available)
2. ✅ Cố gắng update từ API (nếu có)
3. ✅ Graceful degradation khi API fail
4. ✅ Clear error messages và logging

**Backend cần implement:**
- GET /users/profile
- PUT /users/profile  
- GET /users/bookings
- POST /bookings/{id}/cancel
