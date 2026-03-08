# Fix Lỗi "Không Thấy Người Quản Lý" - Hướng Dẫn Chi Tiết

## Vấn Đề

Khi tạo hoặc chỉnh sửa rạp, dropdown "Người Quản Lý" không hiển thị danh sách người quản lý.

## Nguyên Nhân

Endpoint API để lấy danh sách CINEMA_MANAGER không tồn tại:
- Frontend gọi `/api/accounts/roles/CINEMA_MANAGER` → **Không tồn tại**
- Backend không có endpoint này

## Giải Pháp

### Bước 1: Backend Changes (Đã Thực Hiện)

**Tệp: `AdminController.java`**
- ✅ Thêm endpoint mới: `GET /api/admin/roles/{roleName}/users`
- Lấy danh sách users theo role name

**Tệp: `RoleManagementService.java`**
- ✅ Thêm method: `getUsersByRole(String roleName, Integer requestingUserId)`
- Lọc users có role cụ thể

**Tệp: `UserRoleRepository.java`**
- ✅ Thêm method: `findByRoleId(Integer roleId)`
- Query database lấy users theo role

**Tệp: `UserInfo.java`**
- ✅ Thêm fields: `phone`, `isActive`, `createdAt`
- Thêm `@Builder` annotation

### Bước 2: Frontend Changes (Đã Thực Hiện)

**Tệp: `CinemaManagement.js`**
- ✅ Cập nhật URL endpoint:
  ```javascript
  // Cũ:
  const response = await fetch(`${API_BASE_URL}/accounts/roles/CINEMA_MANAGER`, ...);
  
  // Mới:
  const response = await fetch(`${API_BASE_URL}/admin/roles/CINEMA_MANAGER/users`, ...);
  ```
- ✅ Thêm debug logging để kiểm tra response
- ✅ Xử lý lỗi tốt hơn

## API Endpoint Mới

```bash
GET /api/admin/roles/CINEMA_MANAGER/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Response Format**:
```json
{
  "success": true,
  "message": "Users found",
  "data": [
    {
      "userId": 5,
      "email": "manager1@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "isActive": true,
      "createdAt": "2025-12-03T10:00:00Z",
      "roles": ["CINEMA_MANAGER"]
    },
    {
      "userId": 6,
      "email": "manager2@example.com",
      "fullName": "Trần Thị B",
      "phone": "0987654321",
      "isActive": true,
      "createdAt": "2025-12-03T11:00:00Z",
      "roles": ["CINEMA_MANAGER"]
    }
  ]
}
```

## Cách Sử Dụng

### 1. Sau Khi Deploy

**Backend**:
1. Rebuild backend với các thay đổi mới
2. Restart application

**Frontend**:
1. Rebuild React app (hoặc tự động qua hot reload)
2. Clear browser cache (Ctrl+Shift+Delete)

### 2. Test Tính Năng

1. **Đăng nhập** với tài khoản SYSTEM_ADMIN
2. **Vào Cinema Chain Management**
3. **Bấm "Quản Lý Rạp"** trên một chain
4. **Bấm "Thêm Rạp Mới"**
5. **Kiểm tra dropdown "Người Quản Lý"**
   - Phải hiển thị danh sách manager
   - Nếu không, check browser console xem lỗi gì

### 3. Debug Nếu Vẫn Không Hoạt Động

**Check Browser Console** (F12):
```javascript
// Xem lỗi khi gọi API
// Nếu thấy: "Failed to fetch"
//  → Kiểm tra URL đúng không
//  → Kiểm tra backend đã restart
//  → Kiểm tra token có hợp lệ

// Nếu thấy: "200 OK" nhưng data rỗng
// → Có thể chưa có user nào với role CINEMA_MANAGER
// → Cần tạo user và assign role CINEMA_MANAGER
```

**Check Backend Logs**:
```
// Tìm dòng:
"Getting users with role: CINEMA_MANAGER, requested by user: X"
"Found Y users with role CINEMA_MANAGER"

// Nếu không thấy → Endpoint không được gọi
// Nếu thấy "Found 0 users" → Không có manager nào
```

## Tạo CINEMA_MANAGER User

Nếu dropdown rỗng, có thể chưa có user nào có role này.

**Cách 1: Dùng Account Management**
1. Vào **Quản Lý Tài Khoản** (Account Management)
2. Chọn user muốn làm manager
3. Bấm **Edit**
4. Thay đổi **Role** thành **CINEMA_MANAGER**
5. Lưu

**Cách 2: Dùng SQL (Nếu cần)**
```sql
-- Kiểm tra các role
SELECT role_id, role_name FROM roles;

-- Thêm role CINEMA_MANAGER nếu chưa có
INSERT INTO roles (role_name, description) 
VALUES ('CINEMA_MANAGER', 'Người quản lý rạp');

-- Gán role cho user
-- Ví dụ: User ID 5 làm CINEMA_MANAGER
INSERT INTO user_roles (user_id, role_id) 
VALUES (5, (SELECT role_id FROM roles WHERE role_name = 'CINEMA_MANAGER'));

-- Kiểm tra
SELECT u.user_id, u.full_name, r.role_name 
FROM users u 
JOIN user_roles ur ON u.user_id = ur.user_id 
JOIN roles r ON ur.role_id = r.role_id 
WHERE r.role_name = 'CINEMA_MANAGER';
```

## Kiểm Tra Hoàn Thành

- [ ] Backend đã rebuild với code mới
- [ ] Backend đã restart
- [ ] Frontend đã rebuild hoặc clear cache
- [ ] Có ít nhất 1 user với role CINEMA_MANAGER
- [ ] Dropdown hiển thị danh sách manager
- [ ] Có thể chọn manager từ dropdown
- [ ] Có thể tạo rạp với manager assignment
- [ ] Manager info hiển thị trên cinema card

## Các Tệp Đã Thay Đổi

**Backend**:
1. `AdminController.java` - Endpoint mới
2. `RoleManagementService.java` - Method mới
3. `UserRoleRepository.java` - Query mới
4. `UserInfo.java` - Fields mới

**Frontend**:
1. `CinemaManagement.js` - API endpoint mới

## Troubleshooting

| Lỗi | Giải Pháp |
|-----|---------|
| Dropdown rỗng | Tạo user với role CINEMA_MANAGER |
| API 404 | Backend chưa rebuild, cần restart |
| API 403 | User không phải SYSTEM_ADMIN, không có quyền |
| API 500 | Lỗi backend, check logs |
| Data không hiển thị | Thử clear cache, Ctrl+Shift+Delete |

## Performance

- ✅ Query chỉ lấy users có role cụ thể (hiệu quả)
- ✅ Dùng index trên role_id (nhanh)
- ✅ Cache sau khi fetch (tránh gọi API liên tục)

---

**Status**: ✅ **Sửa xong - Sẵn sàng test**
