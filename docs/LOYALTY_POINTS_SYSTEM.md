# Hệ Thống Tích Điểm Thành Viên (Loyalty Points System)

## Tổng Quan

Hệ thống tích điểm tự động cho phép khách hàng nhận điểm thưởng khi thanh toán booking thành công.

### Công Thức Tích Điểm

```
Điểm cơ bản = Tổng tiền thanh toán ÷ 1000
Điểm thực nhận = Điểm cơ bản × Hệ số hạng thành viên
```

**Ví dụ:**
- Booking trị giá 150,000 VND
- Hạng Bronze (hệ số 1.0x)
- Điểm nhận = 150,000 ÷ 1000 × 1.0 = **150 điểm**

### Hệ Số Nhân Điểm Theo Hạng

| Hạng | Hệ số | Ví dụ (100k VND) |
|------|-------|------------------|
| Bronze | 1.0x | 100 điểm |
| Silver | 1.2x | 120 điểm |
| Gold | 1.5x | 150 điểm |
| Platinum | 2.0x | 200 điểm |
| Diamond | 2.5x | 250 điểm |

## Luồng Hoạt Động

### 1. Khi Thanh Toán Thành Công

```java
// PaymentService.processPayment()
1. Xác nhận thanh toán thành công
2. Cập nhật trạng thái booking = PAID
3. Gọi LoyaltyPointsService.earnPointsFromBooking()
   - Tính điểm cơ bản
   - Áp dụng hệ số nhân điểm từ tier
   - Cập nhật membership (totalPoints, availablePoints)
   - Tạo PointsTransaction record
   - Kiểm tra và nâng hạng tự động
4. Gửi email xác nhận (bao gồm số điểm nhận được)
```

### 2. Tự Động Nâng Hạng

Hệ thống tự động kiểm tra điều kiện nâng hạng sau mỗi lần tích điểm:

```java
// Điều kiện nâng hạng (một trong hai)
- Chi tiêu hàng năm >= MinAnnualSpending
- Tổng lượt visit >= MinVisitsPerYear
```

## Bảng Database

### Table: points_transactions

```sql
CREATE TABLE points_transactions (
    transaction_id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,  -- EARNED, REDEEMED, EXPIRED, ADJUSTED, BONUS
    points INTEGER NOT NULL,                 -- Dương = tích, Âm = trừ
    description TEXT,
    related_booking_id INTEGER,
    transaction_date TIMESTAMP NOT NULL,
    balance_after INTEGER,                   -- Số dư sau giao dịch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loại Giao Dịch (Transaction Types)

| Type | Mô tả | Points |
|------|-------|--------|
| EARNED | Tích điểm từ booking | Dương (+) |
| REDEEMED | Đổi quà/sử dụng điểm | Âm (-) |
| EXPIRED | Điểm hết hạn | Âm (-) |
| ADJUSTED | Admin điều chỉnh | +/- |
| BONUS | Điểm thưởng đặc biệt | Dương (+) |

## API Endpoints

### 1. Lấy Lịch Sử Tích Điểm

```http
GET /api/loyalty/points/history/{userId}
```

**Response:**
```json
{
  "success": true,
  "message": "Lịch sử điểm thưởng",
  "data": [
    {
      "transactionId": 1,
      "transactionType": "EARNED",
      "points": 150,
      "description": "Tích điểm từ booking BK1234567890",
      "relatedBookingId": 123,
      "relatedBookingCode": "BK1234567890",
      "transactionDate": "2025-12-07T10:30:00Z",
      "balanceAfter": 1250
    },
    {
      "transactionId": 2,
      "transactionType": "REDEEMED",
      "points": -100,
      "description": "Đổi voucher giảm giá 50k",
      "transactionDate": "2025-12-05T14:20:00Z",
      "balanceAfter": 1100
    }
  ]
}
```

### 2. Lấy Số Dư Điểm

```http
GET /api/loyalty/points/balance/{userId}
```

**Response:**
```json
{
  "success": true,
  "message": "Số dư điểm",
  "data": {
    "userId": 1,
    "availablePoints": 1250,
    "totalEarned": 3500,
    "totalRedeemed": 2250
  }
}
```

## Service Methods

### LoyaltyPointsService

#### 1. earnPointsFromBooking()

Tích điểm tự động khi booking được thanh toán.

```java
Integer earnedPoints = loyaltyPointsService.earnPointsFromBooking(booking);
// Returns: Số điểm được tích (0 nếu lỗi)
```

**Flow:**
1. Tìm/tạo membership cho user
2. Tính điểm cơ bản: `totalAmount / 1000`
3. Áp dụng hệ số tier: `basePoints × pointsEarnRate`
4. Cập nhật membership:
   - `totalPoints += earnedPoints`
   - `availablePoints += earnedPoints`
   - `lifetimeSpending += totalAmount`
   - `annualSpending += totalAmount`
   - `totalVisits += 1`
5. Tạo PointsTransaction record
6. Kiểm tra nâng hạng

#### 2. redeemPoints()

Trừ điểm khi user sử dụng (chưa tích hợp vào UI).

```java
boolean success = loyaltyPointsService.redeemPoints(
    userId, 
    100,  // Số điểm cần trừ
    "Đổi voucher giảm giá 50k"
);
```

#### 3. createDefaultMembership()

Tự động tạo membership Bronze cho user mới.

## Frontend Integration

### Hiển thị Điểm Nhận Được

Sau khi thanh toán, có thể hiển thị số điểm nhận được:

```javascript
// Trong payment confirmation
const paymentResult = await paymentService.processPayment(bookingId);
if (paymentResult.success) {
  // Lấy số điểm từ API
  const pointsData = await fetch(`/api/loyalty/points/balance/${userId}`);
  toast.success(`Thanh toán thành công! Bạn nhận được ${earnedPoints} điểm`);
}
```

### Component: PointsHistory

```jsx
import React, { useEffect, useState } from 'react';

function PointsHistory({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    fetchPointsHistory();
    fetchBalance();
  }, [userId]);

  const fetchPointsHistory = async () => {
    const response = await fetch(`/api/loyalty/points/history/${userId}`);
    const data = await response.json();
    if (data.success) {
      setTransactions(data.data);
    }
  };

  const fetchBalance = async () => {
    const response = await fetch(`/api/loyalty/points/balance/${userId}`);
    const data = await response.json();
    if (data.success) {
      setBalance(data.data);
    }
  };

  return (
    <div className="points-history">
      <h2>Điểm Thưởng Của Tôi</h2>
      
      {balance && (
        <div className="points-summary">
          <div className="balance">
            <span>Điểm hiện có:</span>
            <strong>{balance.availablePoints}</strong>
          </div>
          <div className="earned">
            <span>Tổng tích lũy:</span>
            <span>{balance.totalEarned}</span>
          </div>
          <div className="redeemed">
            <span>Đã sử dụng:</span>
            <span>{balance.totalRedeemed}</span>
          </div>
        </div>
      )}

      <div className="transaction-list">
        {transactions.map(tx => (
          <div key={tx.transactionId} className={`transaction ${tx.points > 0 ? 'earned' : 'redeemed'}`}>
            <div className="type">{getTransactionLabel(tx.transactionType)}</div>
            <div className="points">{tx.points > 0 ? '+' : ''}{tx.points}</div>
            <div className="description">{tx.description}</div>
            <div className="date">{new Date(tx.transactionDate).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTransactionLabel(type) {
  const labels = {
    EARNED: '🎁 Tích điểm',
    REDEEMED: '🎁 Đổi quà',
    EXPIRED: '⏰ Hết hạn',
    ADJUSTED: '⚙️ Điều chỉnh',
    BONUS: '🌟 Thưởng'
  };
  return labels[type] || type;
}
```

## Testing

### 1. Test Tích Điểm Cơ Bản

```sql
-- Tạo booking test
INSERT INTO bookings (user_id, total_amount, status, payment_status)
VALUES (1, 150000, 'PENDING', 'PENDING');

-- Thanh toán (gọi API processPayment)
-- Kiểm tra points_transactions
SELECT * FROM points_transactions WHERE membership_id = 
  (SELECT membership_id FROM memberships WHERE user_id = 1)
ORDER BY transaction_date DESC LIMIT 1;

-- Expected: points = 150 (150000 / 1000)
```

### 2. Test Hệ Số Nhân Điểm

```sql
-- Cập nhật user lên Gold tier (rate = 1.5)
UPDATE memberships 
SET tier_id = (SELECT tier_id FROM membership_tiers WHERE tier_name = 'Gold')
WHERE user_id = 1;

-- Booking 100k VND
-- Expected points: 100 × 1.5 = 150 điểm
```

### 3. Test Tự Động Nâng Hạng

```sql
-- Set annual_spending gần đủ Silver
UPDATE memberships 
SET annual_spending = 4900000  -- Silver requires 5M
WHERE user_id = 1;

-- Booking 200k VND
-- Expected: Tự động nâng lên Silver
```

## Troubleshooting

### Không Tích Điểm

**Nguyên nhân:**
1. User chưa có membership
2. Booking amount < 1000 VND
3. Payment status không phải COMPLETED
4. Lỗi database connection

**Giải pháp:**
```bash
# Check logs
grep "earned.*points" application.log

# Verify membership
SELECT * FROM memberships WHERE user_id = ?;

# Check transactions
SELECT * FROM points_transactions 
WHERE membership_id = ? 
ORDER BY transaction_date DESC;
```

### Điểm Không Đúng

**Check tier rate:**
```sql
SELECT m.*, mt.points_earn_rate 
FROM memberships m
JOIN membership_tiers mt ON m.tier_id = mt.tier_id
WHERE m.user_id = ?;
```

## Future Enhancements

1. **Điểm Hết Hạn**
   - Điểm có hiệu lực 12 tháng
   - Cronjob tự động EXPIRE điểm cũ

2. **Đổi Quà**
   - UI catalog quà tặng
   - Tích hợp redeemPoints() API

3. **Bonus Points**
   - Điểm thưởng sinh nhật
   - Điểm khuyến mãi đặc biệt

4. **Thống Kê**
   - Dashboard admin xem tổng điểm đã phát
   - Báo cáo xu hướng sử dụng điểm

## Migration Checklist

- [x] Tạo PointsTransactionType enum
- [x] Tạo PointsTransaction entity
- [x] Tạo PointsTransactionRepository
- [x] Tạo LoyaltyPointsService
- [x] Tích hợp vào PaymentService
- [x] Tạo API endpoints
- [ ] Chạy migration SQL tạo table
- [ ] Test tích điểm thực tế
- [ ] Tích hợp UI hiển thị điểm
- [ ] Cập nhật email template thêm thông tin điểm
