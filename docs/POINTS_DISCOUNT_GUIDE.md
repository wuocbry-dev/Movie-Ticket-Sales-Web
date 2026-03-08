# Hướng Dẫn Sử Dụng Điểm Thưởng Giảm Giá Booking

## Tổng Quan

Hệ thống cho phép khách hàng sử dụng điểm thưởng tích lũy để giảm giá khi đặt vé xem phim.

## Quy Tắc Quy Đổi

| Điểm | Giá Trị VND |
|------|-------------|
| 1 điểm | 1,000 VND |
| 100 điểm | 100,000 VND |
| 500 điểm | 500,000 VND |

## Giới Hạn

- **Tối đa giảm 50%** tổng hóa đơn
- Chỉ áp dụng cho khách hàng đã đăng nhập
- Điểm được trừ ngay khi tạo booking (không hoàn lại nếu hủy)

## Luồng Hoạt Động

### 1. Khi Khách Hàng Đặt Vé

```
1. Chọn ghế → Chọn đồ ăn (tùy chọn) → Trang thanh toán
2. Hệ thống hiển thị số điểm khả dụng
3. Khách nhập số điểm muốn sử dụng
4. Hệ thống tính toán giảm giá (max 50%)
5. Hiển thị tổng tiền sau giảm
6. Xác nhận đặt vé
7. Điểm được trừ ngay lập tức
```

### 2. Backend Processing

```java
// CreateBookingRequest có thêm field:
private Integer pointsToUse; // Số điểm muốn dùng

// BookingService.createBooking():
1. Validate user có đủ điểm
2. Tính toán discount = pointsToUse * 1000 VND
3. Limit discount to 50% of total
4. Áp dụng vào booking.discountAmount
5. Lưu booking.pointsUsed
6. Gọi loyaltyPointsService.redeemPoints() để trừ điểm
```

## API Endpoints

### 1. Lấy Số Dư Điểm
```http
GET /api/loyalty/points/balance/{userId}

Response:
{
  "success": true,
  "data": {
    "userId": 1,
    "availablePoints": 500,
    "totalEarned": 1200,
    "totalRedeemed": 700,
    "pointsToVndRate": 1000
  }
}
```

### 2. Preview Giảm Giá Điểm
```http
GET /api/loyalty/points/preview?userId=1&pointsToUse=100&totalAmount=500000

Response:
{
  "success": true,
  "data": {
    "availablePoints": 500,
    "requestedPoints": 100,
    "actualPointsUsed": 100,
    "discountAmount": 100000,
    "originalAmount": 500000,
    "finalAmount": 400000,
    "maxDiscountPercentage": 50
  }
}
```

### 3. Tạo Booking với Điểm
```http
POST /api/bookings

{
  "userId": 1,
  "showtimeId": 101,
  "seatIds": [1, 2],
  "sessionId": "UUID-xxx",
  "pointsToUse": 100,  // <-- NEW
  "paymentMethod": "BANK_TRANSFER"
}

Response:
{
  "bookingId": 123,
  "bookingCode": "BK123456",
  "subtotal": 200000,
  "discountAmount": 100000,  // Từ điểm
  "pointsUsed": 100,
  "pointsDiscount": 100000,
  "totalAmount": 115500      // Sau giảm + thuế + phí
}
```

## Database Changes

### Bảng `bookings`
```sql
ALTER TABLE bookings ADD COLUMN points_used INT DEFAULT 0;
```

### Bảng `points_transactions`
```sql
-- Khi sử dụng điểm, tạo transaction type = 'REDEEM'
INSERT INTO points_transactions (
  user_id, transaction_type, points_amount, 
  source_type, description
) VALUES (
  1, 'REDEEM', -100, 
  'BOOKING', 'Sử dụng điểm giảm giá booking BK123456'
);
```

## Frontend Components

### BookingConfirmation.js

```javascript
// States mới
const [pointsBalance, setPointsBalance] = useState(null);
const [pointsToUse, setPointsToUse] = useState(0);
const [pointsDiscount, setPointsDiscount] = useState(0);

// Fetch điểm khi load
useEffect(() => {
  const balance = await loyaltyService.getPointsBalance(userId);
  setPointsBalance(balance);
}, [user]);

// Gửi pointsToUse khi booking
const bookingData = {
  ...otherFields,
  pointsToUse: pointsToUse > 0 ? pointsToUse : null
};
```

## Ví Dụ Thực Tế

### Case 1: Booking 200k, có 100 điểm

| Mục | Giá trị |
|-----|---------|
| Giá vé | 180,000 VND |
| Phí dịch vụ | 10,000 VND |
| Thuế VAT 10% | 18,000 VND |
| **Tổng trước giảm** | **208,000 VND** |
| Điểm sử dụng | 100 điểm = 100,000 VND |
| Max giảm (50%) | 104,000 VND |
| **Thực giảm** | **100,000 VND** |
| **Tổng thanh toán** | **108,000 VND** |

### Case 2: Booking 100k, có 500 điểm

| Mục | Giá trị |
|-----|---------|
| Giá vé | 90,000 VND |
| Phí + Thuế | 14,000 VND |
| **Tổng trước giảm** | **104,000 VND** |
| Điểm sử dụng | 500 điểm = 500,000 VND |
| Max giảm (50%) | 52,000 VND |
| **Thực giảm** | **52,000 VND** (chỉ dùng 52 điểm) |
| **Tổng thanh toán** | **52,000 VND** |

## Troubleshooting

### Điểm Không Được Trừ

1. Kiểm tra user có membership:
```sql
SELECT * FROM memberships WHERE user_id = ?;
```

2. Kiểm tra available_points:
```sql
SELECT available_points FROM memberships WHERE user_id = ?;
```

3. Kiểm tra logs:
```
grep "redeemed.*points" application.log
```

### Giảm Giá Không Đúng

1. Xác nhận quy tắc 50%:
```
actualDiscount = min(pointsToUse * 1000, totalAmount * 0.5)
```

2. Kiểm tra booking record:
```sql
SELECT discount_amount, points_used FROM bookings WHERE booking_code = ?;
```
