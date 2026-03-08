# HƯỚNG DẪN STAFF CHECK-IN VÉ VÀ XEM ĐƠN BẮP NƯỚC CỦA RẠP

## 📋 Tổng quan

Tài liệu này hướng dẫn sử dụng các API mới cho phép:
- Staff chỉ được check-in vé của **rạp mình**
- Staff chỉ được xem đơn bắp nước của **rạp mình**

## 🗃️ Database Setup

Chạy script SQL để tạo bảng `cinema_staffs`:

```sql
-- File: docs/add_cinema_staffs_table.sql
CREATE TABLE cinema_staffs (
    cinema_staff_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cinema_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    position VARCHAR(100),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    assigned_by INT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_cinema (user_id, cinema_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);
```

## 🔐 API Endpoints

### 1. Quản lý Staff-Cinema (cho Manager/Admin)

#### Gán staff vào rạp
```bash
POST /api/cinema-staffs/assign?assignedById=1
Authorization: Bearer {manager_token}
Content-Type: application/json

{
    "userId": 5,
    "cinemaId": 1,
    "position": "TICKET_CHECKER",
    "notes": "Nhân viên kiểm vé"
}
```

#### Xem danh sách staff của rạp
```bash
GET /api/cinema-staffs/cinema/1
Authorization: Bearer {manager_token}
```

#### Cho staff nghỉ việc
```bash
DELETE /api/cinema-staffs/remove?userId=5&cinemaId=1
Authorization: Bearer {manager_token}
```

---

### 2. Staff Check-in Vé (chỉ của rạp mình)

#### Lấy thông tin rạp của staff
```bash
GET /api/tickets/staff/my-cinema?staffId=5
Authorization: Bearer {staff_token}
```

**Response:**
```json
{
    "success": true,
    "cinemaId": 1,
    "cinemaName": "CGV Vincom",
    "cinemaAddress": "123 Đường ABC",
    "position": "TICKET_CHECKER",
    "startDate": "2025-12-08T10:00:00Z",
    "isActive": true
}
```

#### Lấy thông tin booking để check-in
```bash
GET /api/tickets/staff/booking-details?bookingCode=BK123456
Authorization: Bearer {staff_token}
```

#### Check-in vé
```bash
POST /api/tickets/check-in
Authorization: Bearer {staff_token}
Content-Type: application/json

{
    "bookingCode": "BK123456",
    "staffId": 5
}
```

**Lưu ý:**
- ✅ Nếu vé thuộc rạp của staff → Check-in thành công
- ❌ Nếu vé thuộc rạp khác → Lỗi: "Bạn không có quyền check-in vé của rạp X"
- ❌ Nếu staff chưa được gán rạp → Lỗi: "Bạn chưa được gán vào rạp nào"

---

### 3. Staff Xem Đơn Bắp Nước (chỉ của rạp mình)

#### Xem đơn bắp nước của rạp mình
```bash
GET /api/concessions/orders/staff/my-cinema?staffId=5&status=PENDING
Authorization: Bearer {staff_token}
```

**Response:**
```json
[
    {
        "orderId": 45,
        "userId": 10,
        "userName": "Nguyễn Văn A",
        "cinemaId": 1,
        "cinemaName": "CGV Vincom",
        "totalAmount": 150000,
        "status": "PENDING",
        "items": [
            {
                "itemName": "Bắp rang bơ lớn",
                "quantity": 2,
                "unitPrice": 50000
            },
            {
                "itemName": "Coca Cola",
                "quantity": 1,
                "unitPrice": 30000
            }
        ]
    }
]
```

#### Cập nhật trạng thái đơn bắp nước
```bash
# Xác nhận đơn
PUT /api/concessions/orders/45/confirm
Authorization: Bearer {staff_token}

# Bắt đầu chuẩn bị
PUT /api/concessions/orders/45/prepare
Authorization: Bearer {staff_token}

# Sẵn sàng giao
PUT /api/concessions/orders/45/ready
Authorization: Bearer {staff_token}

# Hoàn thành
PUT /api/concessions/orders/45/complete
Authorization: Bearer {staff_token}
```

---

## 🔄 Workflow

### Check-in Vé
```
1. Manager gán staff vào rạp (POST /api/cinema-staffs/assign)
2. Staff đăng nhập và xem thông tin rạp (GET /api/tickets/staff/my-cinema)
3. Staff quét QR hoặc nhập mã booking
4. Hệ thống kiểm tra:
   - Vé có thuộc rạp của staff không?
   - Vé đã thanh toán chưa?
   - Vé đã check-in chưa?
5. Nếu OK → Check-in thành công
```

### Xử lý Đơn Bắp Nước
```
1. Staff xem danh sách đơn pending (GET /api/concessions/orders/staff/my-cinema)
2. Staff xác nhận đơn (PUT /api/concessions/orders/{id}/confirm)
3. Staff chuẩn bị đơn (PUT /api/concessions/orders/{id}/prepare)
4. Staff báo sẵn sàng (PUT /api/concessions/orders/{id}/ready)
5. Khách lấy hàng → Hoàn thành (PUT /api/concessions/orders/{id}/complete)
```

---

## 🛡️ Bảo mật

| API | CINEMA_STAFF | CINEMA_MANAGER | SYSTEM_ADMIN |
|-----|--------------|----------------|--------------|
| Gán staff | ❌ | ✅ | ✅ |
| Xem staff list | ❌ | ✅ (của rạp mình) | ✅ (tất cả) |
| Check-in vé | ✅ (rạp mình) | ✅ (rạp mình) | ✅ (tất cả) |
| Xem đơn bắp nước | ✅ (rạp mình) | ✅ (rạp mình) | ✅ (tất cả) |
| Cập nhật đơn | ✅ (rạp mình) | ✅ (rạp mình) | ✅ (tất cả) |

---

## 📝 Ví dụ SQL Insert Staff

```sql
-- Gán user_id=5 làm staff tại cinema_id=1
INSERT INTO cinema_staffs (user_id, cinema_id, position, notes, assigned_by)
VALUES (5, 1, 'TICKET_CHECKER', 'Nhân viên kiểm vé ca sáng', 1);

-- Gán user_id=6 làm staff bán bắp nước tại cinema_id=1
INSERT INTO cinema_staffs (user_id, cinema_id, position, notes, assigned_by)
VALUES (6, 1, 'CONCESSION', 'Nhân viên bán bắp nước', 1);
```

---

## 🔧 Troubleshooting

### Lỗi: "Bạn chưa được gán vào rạp nào"
- **Nguyên nhân:** User chưa có record trong bảng `cinema_staffs`
- **Giải pháp:** Manager gán staff vào rạp qua API hoặc SQL

### Lỗi: "Bạn không có quyền check-in vé của rạp X"
- **Nguyên nhân:** Staff đang cố check-in vé của rạp khác
- **Giải pháp:** Chỉ check-in vé của rạp mình

### Lỗi: "Nhân viên đang làm việc tại rạp Y"
- **Nguyên nhân:** Staff đã được gán vào rạp khác và đang active
- **Giải pháp:** Remove staff khỏi rạp cũ trước khi gán rạp mới
