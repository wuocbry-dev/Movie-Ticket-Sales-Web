# API Documentation - Concession Management System
## Hệ thống quản lý bắp nước đầy đủ

---

## 📋 Tổng quan

Hệ thống bao gồm 5 bảng chính và 4 API Controllers:

| Bảng | Controller | Mục đích |
|------|-----------|----------|
| `concession_categories` | `ConcessionCategoryController` | Quản lý danh mục (Combo, Bắp rang, Nước ngọt...) |
| `concession_items` | `ConcessionItemController` | Quản lý sản phẩm master (data gốc) |
| `cinema_concession_items` | `CinemaConcessionController` | Quản lý giá & tồn kho theo từng rạp |
| `concession_orders` | `ConcessionOrderController` | Quản lý đơn hàng |
| `concession_order_items` | _(Được quản lý trong `ConcessionOrderController`)_ | Chi tiết đơn hàng |

---

## 1️⃣ Concession Categories API
**Base URL:** `/api/concessions/categories`

### 1.1 Lấy tất cả categories
```http
GET /api/concessions/categories
```
**Response:**
```json
[
  {
    "id": 1,
    "categoryName": "Combo",
    "description": "Các combo tiết kiệm",
    "displayOrder": 1,
    "isActive": true
  }
]
```

### 1.2 Tạo category mới (Admin)
```http
POST /api/concessions/categories
Authorization: Bearer {token}
```
**Request:**
```json
{
  "categoryName": "Snacks",
  "description": "Đồ ăn vặt",
  "displayOrder": 3
}
```

### 1.3 Cập nhật category (Admin)
```http
PUT /api/concessions/categories/1
```

### 1.4 Bật/tắt category (Admin)
```http
PUT /api/concessions/categories/1/toggle
```

### 1.5 Sắp xếp lại categories (Admin)
```http
PUT /api/concessions/categories/reorder
```
**Request:**
```json
[
  {"id": 1, "displayOrder": 1},
  {"id": 2, "displayOrder": 2},
  {"id": 3, "displayOrder": 3}
]
```

---

## 2️⃣ Concession Items API
**Base URL:** `/api/concessions/items`

### 2.1 Lấy tất cả items
```http
GET /api/concessions/items
```

### 2.2 Lấy items theo category
```http
GET /api/concessions/items/category/1
```

### 2.3 Lấy tất cả combos
```http
GET /api/concessions/items/combos
```

### 2.4 Lấy items không phải combo
```http
GET /api/concessions/items/non-combos
```

### 2.5 Search items
```http
GET /api/concessions/items/search?keyword=bắp
```

### 2.6 Tạo item mới (Admin)
```http
POST /api/concessions/items
Authorization: Bearer {token}
```
**Request:**
```json
{
  "category": {"id": 1},
  "itemName": "Combo Couple",
  "description": "2 bắp lớn + 2 nước ngọt",
  "price": 150000,
  "costPrice": 80000,
  "size": "Large",
  "calories": 800,
  "imageUrl": "https://...",
  "isCombo": true,
  "displayOrder": 1
}
```

### 2.7 Cập nhật item (Admin)
```http
PUT /api/concessions/items/5
```

### 2.8 Xóa item (Admin) - Soft delete
```http
DELETE /api/concessions/items/5
```

### 2.9 Bật/tắt item (Admin)
```http
PUT /api/concessions/items/5/toggle
```

### 2.10 Lấy items tồn kho thấp (Admin)
```http
GET /api/concessions/items/low-stock
```

### 2.11 Thống kê items (Admin)
```http
GET /api/concessions/items/stats
```
**Response:**
```json
{
  "totalItems": 25,
  "totalCombos": 8,
  "totalNonCombos": 17
}
```

---

## 3️⃣ Cinema Concession Items API
**Base URL:** `/api/cinemas/{cinemaId}/concessions`

### 3.1 Xem menu bắp nước tại rạp (Khách hàng)
```http
GET /api/cinemas/1/concessions
```

### 3.2 Xem theo category tại rạp
```http
GET /api/cinemas/1/concessions/category/1
```

### 3.3 Chi tiết item tại rạp
```http
GET /api/cinemas/1/concessions/items/5
```

### 3.4 Thêm item vào rạp với giá tùy chỉnh (Manager)
```http
POST /api/cinemas/1/concessions/items
Authorization: Bearer {token}
```
**Request:**
```json
{
  "itemId": 5,
  "customPrice": 165000,
  "stockQuantity": 100
}
```

### 3.5 Cập nhật giá item tại rạp (Manager)
```http
PUT /api/cinemas/1/concessions/items/5/price
```
**Request:**
```json
{
  "newPrice": 145000
}
```

### 3.6 Cập nhật tồn kho (Manager)
```http
PUT /api/cinemas/1/concessions/items/5/stock
```
**Request:**
```json
{
  "stockQuantity": 150
}
```

### 3.7 Bật/tắt bán item (Manager)
```http
PUT /api/cinemas/1/concessions/items/5/toggle
```

### 3.8 Xem tồn kho thấp (Manager)
```http
GET /api/cinemas/1/concessions/low-stock?threshold=20
```

### 3.9 Đồng bộ items vào rạp mới (Admin)
```http
POST /api/cinemas/1/concessions/sync
```

---

## 4️⃣ Concession Orders API
**Base URL:** `/api/concessions/orders`

### 4.1 Tạo đơn hàng mới (User)
```http
POST /api/concessions/orders
Authorization: Bearer {token}
```
**Request:**
```json
{
  "userId": 123,
  "cinemaId": 1,
  "showtimeId": 456,
  "notes": "Không đá",
  "items": [
    {
      "itemId": 5,
      "quantity": 1,
      "notes": "Bắp nhiều bơ"
    },
    {
      "itemId": 8,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "orderId": 789,
  "orderNumber": "CO1733558400000",
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "cinemaId": 1,
  "cinemaName": "Q Cinema Thủ Đức",
  "totalAmount": 165000,
  "status": "PENDING",
  "createdAt": "2025-12-07T10:30:00Z",
  "items": [
    {
      "itemId": 5,
      "itemName": "Combo Couple",
      "quantity": 1,
      "unitPrice": 165000,
      "subtotal": 165000
    }
  ]
}
```

### 4.2 Lấy chi tiết đơn hàng
```http
GET /api/concessions/orders/789
Authorization: Bearer {token}
```

### 4.3 Lấy đơn hàng theo order number
```http
GET /api/concessions/orders/number/CO1733558400000
Authorization: Bearer {token}
```

### 4.4 Lấy đơn hàng của user
```http
GET /api/concessions/orders/user/123
Authorization: Bearer {token}
```

### 4.5 Lấy đơn hàng của rạp (Manager)
```http
GET /api/concessions/orders/cinema/1?status=PENDING
Authorization: Bearer {token}
```

### 4.6 Xác nhận đơn hàng (Manager)
```http
PUT /api/concessions/orders/789/confirm
Authorization: Bearer {token}
```

### 4.7 Bắt đầu chuẩn bị (Manager)
```http
PUT /api/concessions/orders/789/prepare
```

### 4.8 Đánh dấu sẵn sàng lấy (Manager)
```http
PUT /api/concessions/orders/789/ready
```

### 4.9 Hoàn thành đơn hàng (Manager)
```http
PUT /api/concessions/orders/789/complete
```

### 4.10 Hủy đơn hàng
```http
PUT /api/concessions/orders/789/cancel
Authorization: Bearer {token}
```
**Request:**
```json
{
  "reason": "Khách không muốn mua nữa"
}
```

---

## 🔄 Workflow đặt hàng bắp nước

### 1. Khách hàng xem menu và đặt hàng
```bash
# Bước 1: Xem menu tại rạp
GET /api/cinemas/1/concessions

# Bước 2: Tạo đơn hàng
POST /api/concessions/orders
{
  "userId": 123,
  "cinemaId": 1,
  "items": [{"itemId": 5, "quantity": 1}]
}
```

### 2. Manager xử lý đơn hàng
```bash
# Bước 1: Xem đơn hàng pending
GET /api/concessions/orders/cinema/1?status=PENDING

# Bước 2: Xác nhận
PUT /api/concessions/orders/789/confirm

# Bước 3: Bắt đầu chuẩn bị
PUT /api/concessions/orders/789/prepare

# Bước 4: Sẵn sàng lấy
PUT /api/concessions/orders/789/ready

# Bước 5: Khách lấy hàng -> Hoàn thành
PUT /api/concessions/orders/789/complete
```

---

## 📊 Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
    ↓          ↓           ↓          ↓
         CANCELLED (có thể hủy bất cứ lúc nào trước COMPLETED)
```

---

## ✅ Quyền truy cập

| API | Role Required |
|-----|---------------|
| GET items/menu | Public |
| POST order | Authenticated User |
| GET user's orders | Authenticated User |
| Manage categories/items | SYSTEM_ADMIN, CHAIN_ADMIN |
| Manage cinema items/prices | CINEMA_MANAGER, CHAIN_ADMIN, SYSTEM_ADMIN |
| Manage orders at cinema | CINEMA_MANAGER, CHAIN_ADMIN, SYSTEM_ADMIN |

---

## 🎯 Use Cases thực tế

### Use Case 1: Admin tạo sản phẩm mới
```bash
# 1. Tạo category (nếu chưa có)
POST /api/concessions/categories
{"categoryName": "Combo", "displayOrder": 1}

# 2. Tạo item
POST /api/concessions/items
{
  "category": {"id": 1},
  "itemName": "Combo Couple",
  "price": 150000,
  "isCombo": true
}
```

### Use Case 2: Manager set giá riêng cho rạp
```bash
# 1. Thêm item vào rạp với giá tùy chỉnh
POST /api/cinemas/1/concessions/items
{
  "itemId": 5,
  "customPrice": 165000,  # Đắt hơn giá gốc 10%
  "stockQuantity": 100
}

# 2. Update giá khi khuyến mãi
PUT /api/cinemas/1/concessions/items/5/price
{"newPrice": 145000}
```

### Use Case 3: Khách đặt hàng
```bash
# 1. Xem menu
GET /api/cinemas/1/concessions

# 2. Đặt hàng
POST /api/concessions/orders
{
  "userId": 123,
  "cinemaId": 1,
  "items": [
    {"itemId": 5, "quantity": 1}
  ]
}

# 3. Theo dõi đơn hàng
GET /api/concessions/orders/789
```

### Use Case 4: Manager theo dõi tồn kho
```bash
# 1. Xem tồn kho thấp
GET /api/cinemas/1/concessions/low-stock?threshold=20

# 2. Nhập hàng
PUT /api/cinemas/1/concessions/items/5/stock
{"stockQuantity": 200}
```

---

## 🚀 Setup & Testing

### 1. Run SQL migrations
```bash
mysql -u root -p movie_ticket_sales < docs/add_cinema_concession_items_table.sql
```

### 2. Restart Spring Boot
```bash
./mvnw spring-boot:run
```

### 3. Test APIs với Postman hoặc curl
```bash
# Test 1: Lấy categories
curl http://localhost:8080/api/concessions/categories

# Test 2: Lấy items
curl http://localhost:8080/api/concessions/items

# Test 3: Xem menu rạp 1
curl http://localhost:8080/api/cinemas/1/concessions

# Test 4: Tạo đơn hàng (cần token)
curl -X POST http://localhost:8080/api/concessions/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "cinemaId": 1,
    "items": [{"itemId": 5, "quantity": 1}]
  }'
```

---

## 📝 Notes

- Tất cả APIs có authentication đều yêu cầu JWT token trong header
- Giá item ưu tiên: `cinema_price` > `default_price`
- Soft delete: Set `is_available = false` thay vì xóa thật
- Order number format: `CO{timestamp}`
- Status flow: PENDING → CONFIRMED → PREPARING → READY → COMPLETED

---

Hoàn thành! 🎉 Tất cả APIs cho 5 bảng đã được triển khai đầy đủ.
