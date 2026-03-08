# 🎫 HƯỚNG DẪN TEST CHECK-IN VÉ

## ✅ Đã Fix

### Backend:
1. ✅ **Kiểm tra vé đã sử dụng**: Dùng `stream().anyMatch()` để kiểm tra tất cả vé
2. ✅ **Ngăn chặn duplicate check-in**: Return error nếu có bất kỳ vé nào đã USED
3. ✅ **Thông báo rõ ràng**: "Vé đã được check-in trước đó. Không thể check-in lại!"
4. ✅ **Update booking status**: PAID → COMPLETED sau khi check-in thành công

### Frontend:
1. ✅ **Hiển thị cảnh báo**: Toast warning khi vé đã check-in
2. ✅ **Hiển thị error từ backend**: Show message từ API response
3. ✅ **UI rõ ràng**: Badge status "✗ Đã check-in" màu đỏ

---

## 📋 Test Scenarios

### Scenario 1: Check-in Thành Công ✅
**Điều kiện:**
- Booking status: `PAID`
- Tất cả tickets status: `PAID` (chưa USED)
- Trong khung giờ check-in (30 phút trước → 30 phút sau giờ chiếu)

**Steps:**
1. Đăng nhập với role `CINEMA_STAFF`
2. Vào trang `/staff/check-in`
3. Nhập booking code hoặc quét QR
4. Click "Xác nhận check-in"

**Expected:**
- ✅ Toast: "Check-in thành công!"
- ✅ Booking status → `COMPLETED`
- ✅ Tickets status → `USED`
- ✅ Tickets `checkedInAt` → current timestamp
- ✅ Tickets `checkedInBy` → staff user

---

### Scenario 2: Ngăn Chặn Duplicate Check-in ❌
**Điều kiện:**
- Booking đã check-in trước đó
- Tickets status: `USED`
- `checkedInAt` !== null

**Steps:**
1. Scan lại cùng booking code đã check-in
2. Click "Xác nhận check-in"

**Expected:**
- ⚠️ Toast warning: "Vé đã được check-in trước đó!"
- ❌ Button "Xác nhận check-in" bị disable
- ❌ Badge hiển thị: "✗ Đã check-in" (màu đỏ)
- ❌ Backend return 400: "Vé đã được check-in trước đó. Không thể check-in lại!"

---

### Scenario 3: Booking Chưa Thanh Toán ❌
**Điều kiện:**
- Booking status: `PENDING` hoặc `CONFIRMED`

**Expected:**
- ❌ Badge: "✗ Chưa thanh toán"
- ❌ Button disable
- ❌ Backend return: "Booking is not paid"

---

### Scenario 4: Quá Thời Gian Check-in ❌
**Điều kiện:**
- Hiện tại > giờ chiếu + 30 phút

**Expected:**
- ❌ Backend return: "Check-in time has passed"

---

## 🔧 API Endpoints

### 1. Get Booking by Code
```http
GET /api/bookings/code/{bookingCode}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "bookingCode": "BK202512051300012941",
  "status": "PAID",
  "customerName": "Quynh Nhu",
  "movieTitle": "Spider-Man",
  "tickets": [
    {
      "seatRow": "A",
      "seatNumber": "1",
      "status": "PAID",
      "checkedInAt": null,
      "checkedInBy": null
    }
  ]
}
```

### 2. Check-in Tickets
```http
POST /api/tickets/check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingCode": "BK202512051300012941",
  "staffId": 7
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Check-in successful for 4 ticket(s)",
  "data": "BK202512051300012941"
}
```

**Error Response (Already Checked In):**
```json
{
  "success": false,
  "message": "Vé đã được check-in trước đó. Không thể check-in lại!"
}
```

---

## 🎯 Database Changes After Check-in

### Table: `bookings`
| Field | Before | After |
|-------|--------|-------|
| status | PAID | COMPLETED |
| updated_at | old timestamp | current timestamp |

### Table: `tickets`
| Field | Before | After |
|-------|--------|-------|
| status | PAID | USED |
| checked_in_at | NULL | 2025-12-05 17:00:00 |
| checked_in_by | NULL | 7 (staff_id) |

---

## 🐛 Debugging

### Frontend Console Logs:
```javascript
// Check ticket status
data.tickets.forEach(ticket => {
  console.log({
    seat: `${ticket.seatRow}${ticket.seatNumber}`,
    checkedInAt: ticket.checkedInAt,
    isCheckedIn: ticket.checkedInAt !== null
  });
});
```

### Backend Logs:
```
INFO  - Check-in successful for booking: BK202512051300012941
WARN  - Vé đã được check-in trước đó
```

---

## ✨ UI States

### Valid Ticket (Chưa check-in):
- 🟢 Badge: "✓ Hợp lệ" (màu xanh)
- 🟢 Button: "Xác nhận check-in" (enabled)

### Already Checked In:
- 🔴 Badge: "✗ Đã check-in" (màu đỏ)
- ⚪ Button: "Xác nhận check-in" (disabled)
- ⚠️ Toast: "Vé đã được check-in trước đó!"

### Invalid Status:
- 🔴 Badge: "✗ Chưa thanh toán" / "✗ Đã hủy" / "✗ Đã hoàn tiền"
- ⚪ Button: disabled

---

## 📱 QR Code Flow

1. Staff click "📷 Quét QR"
2. Camera mở → scan QR code
3. QR code chứa booking code (e.g., "BK202512051300012941")
4. Auto fill vào input và tự động search
5. Hiển thị thông tin vé
6. Staff click "Xác nhận check-in"

---

## 🔒 Security

- ✅ Endpoint `/api/tickets/check-in` yêu cầu role: `CINEMA_STAFF`, `CINEMA_MANAGER`, `SYSTEM_ADMIN`
- ✅ JWT token bắt buộc
- ✅ staffId được lấy từ localStorage (user.userId)
- ✅ Backend validate staff exists trong database

---

## 🚀 Next Steps

1. ✅ Test tất cả scenarios
2. ✅ Verify database changes
3. ⚠️ Optional: Add check-in history/logs
4. ⚠️ Optional: Print ticket after check-in
5. ⚠️ Optional: Send SMS confirmation

---

**Last Updated:** 2025-12-05
