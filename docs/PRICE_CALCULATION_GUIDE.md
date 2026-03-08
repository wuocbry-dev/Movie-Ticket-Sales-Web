# 💰 Hệ Thống Tính Giá Vé

## Công Thức Tính Giá (Đồng Bộ Backend-Frontend)

### Backend: `BookingService.java`
```java
// Hằng số
private static final BigDecimal TAX_RATE = new BigDecimal("0.10");      // 10% thuế VAT
private static final BigDecimal SERVICE_FEE = new BigDecimal("5000");   // 5,000 VND/ghế

// Công thức
subtotal = basePrice × số_ghế
serviceFeeTotal = 5,000 × số_ghế  
taxAmount = subtotal × 0.10
totalAmount = subtotal + serviceFeeTotal + taxAmount - discount
```

### Frontend: `priceCalculation.js`
```javascript
// Hằng số
export const TAX_RATE = 0.10;                    // 10% thuế VAT
export const SERVICE_FEE_PER_TICKET = 5000;      // 5,000 VND/ghế

// Sử dụng
import { calculateBookingPrice, formatPrice } from '../utils/priceCalculation';

const priceDetails = calculateBookingPrice(basePrice, numberOfSeats, discount);
// Returns: { subtotal, serviceFee, tax, discount, total }
```

## 📊 Ví Dụ Tính Toán

### Trường hợp 1: 2 ghế thường, giá 100,000 VND/ghế
```
Giá vé (subtotal)       = 100,000 × 2      = 200,000 VND
Phí dịch vụ             = 5,000 × 2        =  10,000 VND
Thuế VAT (10%)          = 200,000 × 0.10   =  20,000 VND
─────────────────────────────────────────────────────────
TỔNG CỘNG               = 200,000 + 10,000 + 20,000 = 230,000 VND
```

### Trường hợp 2: 3 ghế VIP, giá 150,000 VND/ghế
```
Giá vé (subtotal)       = 150,000 × 3      = 450,000 VND
Phí dịch vụ             = 5,000 × 3        =  15,000 VND
Thuế VAT (10%)          = 450,000 × 0.10   =  45,000 VND
─────────────────────────────────────────────────────────
TỔNG CỘNG               = 450,000 + 15,000 + 45,000 = 510,000 VND
```

### Trường hợp 3: 2 ghế thường + voucher giảm 20,000 VND
```
Giá vé (subtotal)       = 100,000 × 2      = 200,000 VND
Phí dịch vụ             = 5,000 × 2        =  10,000 VND
Thuế VAT (10%)          = 200,000 × 0.10   =  20,000 VND
Giảm giá                =                     -20,000 VND
─────────────────────────────────────────────────────────
TỔNG CỘNG               = 200,000 + 10,000 + 20,000 - 20,000 = 210,000 VND
```

## 🎫 Giá Ghế Theo Loại

```javascript
const calculateSeatPrice = (basePrice, seatType) => {
  switch (seatType) {
    case 'VIP':      return basePrice × 1.5;  // Tăng 50%
    case 'COUPLE':   return basePrice × 2;    // Tăng 100%
    case 'DISABLED': return basePrice × 0.8;  // Giảm 20%
    case 'NORMAL':   return basePrice;        // Giá gốc
  }
};
```

### Ví dụ: Base price = 100,000 VND
- **Ghế thường (NORMAL)**: 100,000 VND
- **Ghế VIP**: 150,000 VND (100,000 × 1.5)
- **Ghế đôi (COUPLE)**: 200,000 VND (100,000 × 2)
- **Ghế người khuyết tật**: 80,000 VND (100,000 × 0.8)

## 🔄 Luồng Tính Giá

```
1. SeatSelection.js
   ├─ Lấy basePrice từ showtime
   ├─ Tính giá mỗi ghế theo loại
   ├─ Tổng giá ghế = sum(giá từng ghế)
   └─ Navigate đến BookingConfirmation

2. BookingConfirmation.js
   ├─ Import calculateBookingPrice()
   ├─ priceDetails = calculateBookingPrice(basePrice, seats, discount)
   ├─ Hiển thị chi tiết:
   │  ├─ Giá vé (subtotal)
   │  ├─ Phí dịch vụ
   │  ├─ Thuế VAT
   │  ├─ Giảm giá (nếu có)
   │  └─ Tổng cộng
   └─ Tạo VietQR với priceDetails.total

3. Backend Validation
   ├─ Nhận booking request
   ├─ Tính lại giá theo công thức
   ├─ So sánh với giá frontend gửi lên
   └─ Accept/Reject booking
```

## 📱 Hiển Thị Trên UI

### BookingConfirmation.js
```jsx
<div className="summary-row">
  <span>Giá vé ({seats.length} ghế × {formatPrice(basePrice)})</span>
  <span>{formatPrice(priceDetails.subtotal)}</span>
</div>
<div className="summary-row">
  <span>Phí dịch vụ ({seats.length} × {formatPrice(5000)})</span>
  <span>{formatPrice(priceDetails.serviceFee)}</span>
</div>
<div className="summary-row">
  <span>Thuế VAT (10%)</span>
  <span>{formatPrice(priceDetails.tax)}</span>
</div>
<div className="summary-total">
  <span>Tổng cộng</span>
  <span>{formatPrice(priceDetails.total)}</span>
</div>
```

## 🛡️ Validation & Security

### Backend Validation (BookingService.java)
```java
// 1. Validate seats availability
// 2. Recalculate price từ database
// 3. Compare với price từ frontend
// 4. Reject nếu không khớp (chống hack giá)
```

### Frontend Validation
```javascript
// 1. Check basePrice > 0
// 2. Check numberOfSeats > 0
// 3. Format số tiền (làm tròn)
// 4. Display chi tiết rõ ràng
```

## 🔧 Cách Thay Đổi Giá

### Thay đổi phí dịch vụ:
1. Backend: Sửa `SERVICE_FEE` trong `BookingService.java`
2. Frontend: Sửa `SERVICE_FEE_PER_TICKET` trong `priceCalculation.js`

### Thay đổi thuế VAT:
1. Backend: Sửa `TAX_RATE` trong `BookingService.java`
2. Frontend: Sửa `TAX_RATE` trong `priceCalculation.js`

### ⚠️ LƯU Ý: Phải đồng bộ cả 2 bên để tránh lỗi!

## 📝 Testing Checklist

- [ ] Tính giá đúng cho 1 ghế thường
- [ ] Tính giá đúng cho nhiều ghế
- [ ] Tính giá đúng cho ghế VIP, Couple
- [ ] Áp dụng voucher giảm giá đúng
- [ ] Thuế VAT tính đúng 10%
- [ ] Phí dịch vụ tính đúng 5,000 VND/ghế
- [ ] Frontend-Backend price match
- [ ] VietQR hiển thị đúng số tiền
- [ ] Format tiền đúng (₫ VND)
- [ ] Làm tròn số tiền hợp lý

## 🔍 Debug Price Calculation

Console logs trong `BookingConfirmation.js`:
```javascript
console.log('💰 === PRICE CALCULATION ===');
console.log('Base Price:', showtime.basePrice);
console.log('Number of Seats:', selectedSeats.length);
console.log('Subtotal:', priceDetails.subtotal);
console.log('Service Fee:', priceDetails.serviceFee);
console.log('Tax (10%):', priceDetails.tax);
console.log('Total Amount:', priceDetails.total);
```
