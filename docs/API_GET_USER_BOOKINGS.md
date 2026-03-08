# 🎫 API Lấy Danh Sách Vé Của User

## Endpoint

```
GET /api/bookings/user/{userId}
```

## Mô tả
API này cho phép lấy danh sách tất cả các booking (vé) của một user dựa trên userId.

## Request

### URL Parameters
- `userId` (Integer, required): ID của user cần lấy danh sách vé

### Query Parameters
- `page` (Integer, optional, default: 0): Số trang (zero-based)
- `size` (Integer, optional, default: 10): Số lượng items mỗi trang

### Headers
```
Content-Type: application/json
```

## Response

### Success Response (200 OK)

```json
{
  "content": [
    {
      "bookingId": 1,
      "bookingCode": "BK20231206001",
      "userId": 123,
      "username": "john_doe",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "0123456789",
      "showtimeId": 456,
      "movieTitle": "Yêu Nhầm Bạn Thân",
      "cinemaName": "Rạp Chiếu Phim ABC",
      "hallName": "Hall Premium 1",
      "showDate": "lúc 07:00 Thứ Bảy, 6 tháng 12, 2025",
      "startTime": "19:00",
      "formatType": "2D",
      "bookingDate": "2025-12-06T10:30:00Z",
      "totalSeats": 2,
      "subtotal": 200000,
      "discountAmount": 0,
      "taxAmount": 20000,
      "serviceFee": 10000,
      "totalAmount": 230000,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "BANK_TRANSFER",
      "paymentReference": null,
      "paidAt": "2025-12-06T10:35:00Z",
      "holdExpiresAt": null,
      "qrCode": null,
      "invoiceNumber": null,
      "invoiceIssuedAt": null,
      "tickets": [
        {
          "ticketId": 1,
          "ticketCode": "TK20231206001",
          "seatId": 10,
          "seatRow": "G",
          "seatNumber": "2",
          "seatType": "NORMAL",
          "ticketPrice": 100000,
          "serviceFee": 5000,
          "finalPrice": 115000,
          "status": "ACTIVE",
          "isCheckedIn": false,
          "checkedInAt": null
        },
        {
          "ticketId": 2,
          "ticketCode": "TK20231206002",
          "seatId": 11,
          "seatRow": "G",
          "seatNumber": "3",
          "seatType": "NORMAL",
          "ticketPrice": 100000,
          "serviceFee": 5000,
          "finalPrice": 115000,
          "status": "ACTIVE",
          "isCheckedIn": false,
          "checkedInAt": null
        }
      ],
      "createdAt": "2025-12-06T10:30:00Z",
      "updatedAt": "2025-12-06T10:35:00Z"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0,
  "pageSize": 10
}
```

### Error Responses

#### 404 Not Found
```json
{
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Ví dụ sử dụng

### cURL
```bash
curl -X GET "http://localhost:8080/api/bookings/user/123?page=0&size=10" \
  -H "Content-Type: application/json"
```

### JavaScript (Frontend)
```javascript
import bookingService from '../services/bookingService';

// Lấy userId từ localStorage
const userData = JSON.parse(localStorage.getItem('user'));
const userId = userData.userId;

// Gọi API
const response = await bookingService.getUserBookings(userId);

// Response structure
if (response.content) {
  const bookings = response.content; // Array of BookingDto
  const totalBookings = response.totalElements;
  const totalPages = response.totalPages;
  
  console.log('Bookings:', bookings);
}
```

### Axios
```javascript
const response = await axios.get(`http://localhost:8080/api/bookings/user/${userId}`, {
  params: {
    page: 0,
    size: 10
  }
});

const bookings = response.data.content;
```

## Booking Status

| Status | Mô tả |
|--------|-------|
| `PENDING` | Đặt vé chờ thanh toán |
| `CONFIRMED` | Đã thanh toán, chờ check-in |
| `COMPLETED` | Đã check-in và xem phim |
| `CANCELLED` | Đã hủy |
| `EXPIRED` | Hết hạn giữ chỗ |

## Payment Status

| Status | Mô tả |
|--------|-------|
| `PENDING` | Chờ thanh toán |
| `PAID` | Đã thanh toán |
| `REFUNDED` | Đã hoàn tiền |
| `FAILED` | Thanh toán thất bại |

## Frontend Integration

### Component: BookingHistory.js

```javascript
const fetchBookings = async () => {
  try {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const userId = user.userId;
    
    // Call API
    const response = await bookingService.getUserBookings(userId);
    
    // Handle response
    if (response.content) {
      setBookings(response.content);
    } else if (Array.isArray(response)) {
      setBookings(response);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Không thể tải lịch sử đặt vé');
  }
};
```

### Display Booking Card
```jsx
<div className="booking-card">
  <div className="booking-header">
    <span>Mã đặt vé: {booking.bookingCode}</span>
    <span className="status">{booking.status}</span>
  </div>
  
  <div className="booking-content">
    <h3>{booking.movieTitle}</h3>
    <p>{booking.showDate} - {booking.startTime}</p>
    <p>{booking.cinemaName} - {booking.hallName}</p>
    <p>Ghế: {booking.tickets.map(t => `${t.seatRow}${t.seatNumber}`).join(', ')}</p>
    <p className="price">Tổng: {formatCurrency(booking.totalAmount)}</p>
  </div>
  
  <div className="booking-actions">
    <button onClick={() => navigate(`/booking/${booking.bookingId}`)}>
      Xem chi tiết
    </button>
    {booking.status === 'CONFIRMED' && (
      <button onClick={() => handleCancelBooking(booking.bookingId)}>
        Hủy vé
      </button>
    )}
  </div>
</div>
```

## Notes

1. **Pagination**: API support pagination, mặc định trả về 10 bookings/page
2. **Sorting**: Bookings được sắp xếp theo `bookingDate` giảm dần (mới nhất trước)
3. **Tickets**: Mỗi booking chứa array `tickets` với thông tin chi tiết từng ghế
4. **Price Calculation**: 
   - `subtotal` = giá vé × số ghế
   - `serviceFee` = 5,000 VND × số ghế
   - `taxAmount` = subtotal × 10%
   - `totalAmount` = subtotal + serviceFee + taxAmount - discountAmount

## Testing

### Test với Postman
1. Import collection: `docs/Booking_API_Postman_Collection.json`
2. Set environment variable: `baseUrl = http://localhost:8080`
3. Send request: `GET {{baseUrl}}/api/bookings/user/123`

### Test trên Frontend
1. Đăng nhập vào ứng dụng
2. Navigate đến: `http://localhost:3000/bookings`
3. Kiểm tra danh sách bookings hiển thị đúng
4. Verify pagination, filter, và cancel booking

## Related APIs

- `POST /api/bookings` - Tạo booking mới
- `GET /api/bookings/{bookingId}` - Lấy chi tiết booking
- `DELETE /api/bookings/{bookingId}` - Hủy booking
- `GET /api/bookings/code/{bookingCode}` - Lấy booking theo mã
