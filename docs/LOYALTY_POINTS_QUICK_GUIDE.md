# Hệ Thống Tích Điểm Tự Động

## Công Thức

```
1000 VND = 1 điểm

Điểm nhận = (Tổng tiền / 1000) × Hệ số hạng
```

### Hệ Số Theo Hạng

| Hạng | Hệ số | Ví dụ (100k) |
|------|-------|--------------|
| Bronze | 1.0x | 100 điểm |
| Silver | 1.2x | 120 điểm |
| Gold | 1.5x | 150 điểm |
| Platinum | 2.0x | 200 điểm |
| Diamond | 2.5x | 250 điểm |

## Cách Hoạt Động

1. **Khi thanh toán booking thành công** → Tự động tích điểm
2. **PaymentService** gọi `LoyaltyPointsService.earnPointsFromBooking()`
3. Cập nhật:
   - `memberships.total_points` (tổng tích lũy)
   - `memberships.available_points` (còn dùng được)
   - `memberships.lifetime_spending` (tổng chi tiêu)
   - `memberships.annual_spending` (chi tiêu năm)
   - `memberships.total_visits` (số lần ghé)
4. Tạo record trong `points_transactions`
5. Kiểm tra tự động nâng hạng

## API Endpoints

### 1. Lịch Sử Tích Điểm

```http
GET /api/loyalty/points/history/{userId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": 1,
      "transactionType": "EARN",
      "pointsAmount": 150,
      "sourceType": "BOOKING",
      "description": "Tích điểm từ booking BK1234",
      "balanceAfter": 1250,
      "expiresAt": "2026-12-07"
    }
  ]
}
```

### 2. Số Dư Điểm

```http
GET /api/loyalty/points/balance/{userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "availablePoints": 1250,
    "totalEarned": 3500,
    "totalRedeemed": 2250
  }
}
```

## Database

### Table: points_transactions

Đã tồn tại, cấu trúc:
- `user_id` - User nhận/trừ điểm
- `transaction_type` - EARN, REDEEM, EXPIRE, ADJUST, GIFT
- `points_amount` - Số điểm (+ là cộng, - là trừ)
- `source_type` - BOOKING, BONUS, BIRTHDAY, etc.
- `source_id` - ID của booking/order liên quan
- `balance_before` - Số dư trước
- `balance_after` - Số dư sau
- `expires_at` - Ngày hết hạn (1 năm sau khi tích)

## Test

### Test Tích Điểm

1. Đăng nhập user
2. Tạo booking (ví dụ: 150,000 VND)
3. Thanh toán
4. Kiểm tra:

```sql
SELECT * FROM points_transactions 
WHERE user_id = ? 
ORDER BY created_at DESC LIMIT 1;
-- Expected: points_amount = 150
```

```sql
SELECT available_points FROM memberships 
WHERE user_id = ?;
-- Expected: +150 điểm
```

### Test Hệ Số Nhân

User hạng Gold (1.5x):
- Booking 100k → Nhận 150 điểm (100 × 1.5)

### Logs

```
✅ User 1 earned 150 points from booking BK1234 (Base: 150, Rate: 1.0x)
💎 User earned 150 loyalty points from booking BK1234
```

## Tích Hợp Frontend (Tùy Chọn)

```javascript
// Sau khi thanh toán thành công
const balanceResponse = await fetch(`/api/loyalty/points/balance/${userId}`);
const {data} = await balanceResponse.json();
toast.success(`Bạn nhận được ${earnedPoints} điểm! Tổng: ${data.availablePoints}`);
```

## Checklist

- [x] LoyaltyPointsService - Tính và tích điểm
- [x] Tích hợp vào PaymentService
- [x] API endpoints (history, balance)
- [x] Auto tier upgrade
- [x] Transaction logging
- [ ] Chạy backend test
- [ ] Hiển thị điểm trong email
- [ ] UI lịch sử điểm (tùy chọn)

## Notes

- Điểm có hiệu lực 1 năm (expires_at)
- Tự động tạo membership Bronze cho user mới
- Tự động nâng hạng khi đủ điều kiện
- Không fail payment nếu tích điểm lỗi (logged error)
