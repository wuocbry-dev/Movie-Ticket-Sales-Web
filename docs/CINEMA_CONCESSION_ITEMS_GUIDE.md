# Hướng dẫn sử dụng Cinema Concession Items API
## Quản lý giá bắp nước theo từng rạp

### Tổng quan
Hệ thống này cho phép mỗi rạp có giá khác nhau cho cùng một sản phẩm bắp nước/combo. Mỗi rạp có thể:
- Set giá riêng cho từng item
- Quản lý tồn kho riêng
- Bật/tắt bán item
- Theo dõi items có tồn kho thấp

---

## 🎯 APIs cho Khách hàng

### 1. Xem menu bắp nước tại rạp
```http
GET /api/cinemas/{cinemaId}/concessions
```

**Ví dụ:**
```bash
GET /api/cinemas/1/concessions
```

**Response:**
```json
[
  {
    "cinemaItemId": 1,
    "cinemaId": 1,
    "cinemaName": "Q Cinema Thủ Đức",
    "itemId": 5,
    "itemName": "Combo Couple",
    "description": "2 bắp lớn + 2 nước ngọt",
    "categoryId": 1,
    "categoryName": "Combo",
    "imageUrl": "https://...",
    "size": "Large",
    "calories": 800,
    "defaultPrice": 150000,
    "cinemaPrice": 165000,
    "effectivePrice": 165000,
    "stockQuantity": 50,
    "isAvailable": true,
    "displayOrder": 1,
    "notes": "Giá cuối tuần"
  }
]
```

### 2. Xem theo danh mục
```http
GET /api/cinemas/{cinemaId}/concessions/category/{categoryId}
```

**Ví dụ:** Xem tất cả combo tại rạp 1
```bash
GET /api/cinemas/1/concessions/category/1
```

### 3. Chi tiết sản phẩm
```http
GET /api/cinemas/{cinemaId}/concessions/items/{itemId}
```

**Ví dụ:**
```bash
GET /api/cinemas/1/concessions/items/5
```

---

## 🔧 APIs cho Manager (Yêu cầu authentication)

### 4. Thêm item vào rạp với giá tùy chỉnh
```http
POST /api/cinemas/{cinemaId}/concessions/items
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "itemId": 5,
  "customPrice": 165000,
  "stockQuantity": 100
}
```

**Ví dụ:** Thêm combo vào rạp Thủ Đức với giá cao hơn 10%
```bash
POST /api/cinemas/1/concessions/items
{
  "itemId": 5,
  "customPrice": 165000,  // Giá gốc 150k + 10%
  "stockQuantity": 100
}
```

### 5. Cập nhật giá item tại rạp
```http
PUT /api/cinemas/{cinemaId}/concessions/items/{itemId}/price
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "newPrice": 145000
}
```

**Use case:** Giảm giá khuyến mãi cuối tuần
```bash
PUT /api/cinemas/1/concessions/items/5/price
{
  "newPrice": 145000  // Giảm từ 165k xuống 145k
}
```

### 6. Cập nhật tồn kho
```http
PUT /api/cinemas/{cinemaId}/concessions/items/{itemId}/stock
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "stockQuantity": 150
}
```

**Use case:** Nhập thêm hàng
```bash
PUT /api/cinemas/1/concessions/items/5/stock
{
  "stockQuantity": 150
}
```

### 7. Bật/tắt bán item
```http
PUT /api/cinemas/{cinemaId}/concessions/items/{itemId}/toggle
Authorization: Bearer {token}
```

**Use case:** Tạm ngưng bán item hết hàng
```bash
PUT /api/cinemas/1/concessions/items/5/toggle
# Lần 1: Tắt (is_available = false)
# Lần 2: Bật (is_available = true)
```

### 8. Xóa item khỏi rạp
```http
DELETE /api/cinemas/{cinemaId}/concessions/items/{itemId}
Authorization: Bearer {token}
```

**Use case:** Ngừng bán item vĩnh viễn tại rạp này
```bash
DELETE /api/cinemas/1/concessions/items/5
```

### 9. Xem items có tồn kho thấp
```http
GET /api/cinemas/{cinemaId}/concessions/low-stock?threshold=20
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "itemName": "Bắp ngọt lớn",
    "stockQuantity": 15,
    "notes": "Cần nhập hàng gấp"
  }
]
```

### 10. Đồng bộ tất cả items vào rạp mới (Admin only)
```http
POST /api/cinemas/{cinemaId}/concessions/sync
Authorization: Bearer {token}
```

**Use case:** Khi mở rạp mới, tự động thêm tất cả items với giá mặc định
```bash
POST /api/cinemas/5/concessions/sync
```

---

## 📊 Ví dụ Use Cases thực tế

### Use Case 1: Rạp Thủ Đức giá cao hơn trung tâm
```bash
# Rạp 1 (Thủ Đức): +10%
PUT /api/cinemas/1/concessions/items/5/price
{ "newPrice": 165000 }

# Rạp 2 (Quận 1): Giá gốc 150k
# Không cần update, để null -> dùng defaultPrice
```

### Use Case 2: Khuyến mãi cuối tuần
```bash
# Thứ 6: Giảm giá
PUT /api/cinemas/1/concessions/items/5/price
{ "newPrice": 135000 }

# Thứ 2: Về giá gốc
PUT /api/cinemas/1/concessions/items/5/price
{ "newPrice": 150000 }
```

### Use Case 3: Quản lý tồn kho
```bash
# 1. Xem tồn kho thấp
GET /api/cinemas/1/concessions/low-stock?threshold=20

# 2. Nhập hàng
PUT /api/cinemas/1/concessions/items/5/stock
{ "stockQuantity": 200 }

# 3. Hết hàng tạm thời -> Tắt bán
PUT /api/cinemas/1/concessions/items/5/toggle
```

### Use Case 4: So sánh giá giữa các rạp
```bash
# Lấy giá từ 3 rạp
GET /api/cinemas/1/concessions/items/5  # Thủ Đức: 165k
GET /api/cinemas/2/concessions/items/5  # Quận 1: 150k
GET /api/cinemas/3/concessions/items/5  # Bình Thạnh: 155k
```

---

## 🗄️ Database Schema

### Bảng `cinema_concession_items`
```sql
cinema_item_id      INT PRIMARY KEY
cinema_id           INT (FK -> cinemas)
item_id             INT (FK -> concession_items)
cinema_price        DECIMAL(10,2) NULL    -- NULL = dùng giá mặc định
cinema_cost_price   DECIMAL(10,2) NULL
stock_quantity      INT DEFAULT 0
is_available        TINYINT(1) DEFAULT 1
display_order       INT DEFAULT 0
notes               VARCHAR(500)
created_at          TIMESTAMP
updated_at          TIMESTAMP

UNIQUE(cinema_id, item_id)
```

---

## 🔍 Logic giá

### Ưu tiên giá:
1. **cinema_price** (nếu có) - Giá riêng của rạp
2. **default_price** (từ concession_items) - Giá mặc định hệ thống

### Trong code:
```java
public BigDecimal getEffectivePrice() {
    return cinemaPrice != null ? cinemaPrice : item.getPrice();
}
```

### Trong SQL View:
```sql
COALESCE(cci.cinema_price, ci.price) as effective_price
```

---

## ✅ Quyền truy cập

| API | Role Required |
|-----|---------------|
| GET items (xem menu) | Public |
| POST/PUT/DELETE items | CINEMA_MANAGER, CHAIN_ADMIN, SYSTEM_ADMIN |
| GET low-stock | CINEMA_MANAGER, CHAIN_ADMIN, SYSTEM_ADMIN |
| POST sync | CHAIN_ADMIN, SYSTEM_ADMIN |

---

## 🎬 Testing Script

```bash
# 1. Xem menu rạp 1
curl http://localhost:8080/api/cinemas/1/concessions

# 2. Thêm item (cần token)
curl -X POST http://localhost:8080/api/cinemas/1/concessions/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId": 5, "customPrice": 165000, "stockQuantity": 100}'

# 3. Update giá
curl -X PUT http://localhost:8080/api/cinemas/1/concessions/items/5/price \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPrice": 145000}'

# 4. Update tồn kho
curl -X PUT http://localhost:8080/api/cinemas/1/concessions/items/5/stock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stockQuantity": 150}'

# 5. Xem tồn kho thấp
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/cinemas/1/concessions/low-stock?threshold=20
```

---

## 🚀 Migration Steps

1. **Chạy SQL migration:**
   ```bash
   mysql -u root -p movie_ticket_sales < docs/add_cinema_concession_items_table.sql
   ```

2. **Restart Spring Boot app** để load entity mới

3. **Sync items cho rạp hiện có:**
   ```bash
   POST /api/cinemas/1/concessions/sync
   POST /api/cinemas/2/concessions/sync
   # ... for all cinemas
   ```

4. **Customize prices** theo từng rạp

---

## 💡 Best Practices

1. **Giá mặc định**: Để `cinema_price = NULL` nếu muốn dùng giá hệ thống
2. **Tồn kho**: Cập nhật định kỳ để tránh bán hàng hết
3. **Low stock alert**: Check hàng ngày với threshold = 20
4. **Notes field**: Ghi chú khuyến mãi, lý do tạm ngưng bán
5. **Display order**: Sắp xếp items nổi bật lên đầu

---

Đã hoàn thành! 🎉
