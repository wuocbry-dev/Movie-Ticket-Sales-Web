# Fix Lỗi "Không Thấy Người Quản Lý" - Hoàn Tất!

## ✅ Vấn Đề Được Sửa

**Lỗi**: Dropdown "Người Quản Lý" không hiển thị danh sách manager

**Nguyên Nhân**: Endpoint API `/accounts/roles/CINEMA_MANAGER` không tồn tại

## ✅ Giải Pháp Được Thực Hiện

### Backend Changes

**1. AdminController.java**
```java
// Endpoint mới
@GetMapping("/roles/{roleName}/users")
public ResponseEntity<ApiResponse<List<UserInfo>>> getUsersByRole(
    @PathVariable String roleName,
    @RequestHeader("Authorization") String token)
```

**2. RoleManagementService.java**
```java
// Method mới
public ApiResponse<List<UserInfo>> getUsersByRole(String roleName, Integer requestingUserId)
// - Kiểm tra quyền admin
// - Lấy role từ database
// - Lấy tất cả users có role đó
// - Return danh sách UserInfo
```

**3. UserRoleRepository.java**
```java
// Query mới
List<UserRole> findByRoleId(Integer roleId);
```

**4. UserInfo.java**
```java
// Thêm fields
private String phone;
private Boolean isActive;
private Instant createdAt;

// Thêm @Builder annotation
```

### Frontend Changes

**CinemaManagement.js**
```javascript
// Cũ: /api/accounts/roles/CINEMA_MANAGER
// Mới: /api/admin/roles/CINEMA_MANAGER/users

const response = await fetch(`${API_BASE_URL}/admin/roles/CINEMA_MANAGER/users`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## ✅ Build Status

- Backend: **Compile thành công** ✓
- Frontend: **Không có lỗi** ✓

## ✅ Cách Sử Dụng

### 1. Restart Backend
```
Dừng application
Khởi động lại
```

### 2. Tạo CINEMA_MANAGER User (Nếu Chưa Có)

**Cách 1: Qua UI**
- Vào Account Management
- Chọn user
- Edit → Role = CINEMA_MANAGER
- Save

**Cách 2: Qua SQL**
```sql
INSERT INTO user_roles (user_id, role_id) 
VALUES (5, (SELECT role_id FROM roles WHERE role_name = 'CINEMA_MANAGER'));
```

### 3. Test Tính Năng

1. Đăng nhập SYSTEM_ADMIN
2. Vào Cinema Chain Management
3. Bấm "Quản Lý Rạp" trên một chain
4. Bấm "Thêm Rạp Mới"
5. **Kiểm tra dropdown "Người Quản Lý"**
   - Phải hiển thị danh sách manager
   - Có thể chọn manager
   - Manager info hiển thị trên cinema card

## ✅ API Endpoint Mới

```bash
GET /api/admin/roles/CINEMA_MANAGER/users
Authorization: Bearer {token}

Response:
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
      "roles": ["CINEMA_MANAGER"]
    }
  ]
}
```

## ✅ Tệp Được Thay Đổi

| Tệp | Thay Đổi |
|-----|---------|
| AdminController.java | Thêm endpoint /roles/{roleName}/users |
| RoleManagementService.java | Thêm method getUsersByRole() |
| UserRoleRepository.java | Thêm method findByRoleId() |
| UserInfo.java | Thêm fields: phone, isActive, createdAt |
| CinemaManagement.js | Cập nhật endpoint URL |

## ✅ Sẵn Sàng Sử Dụng!

Tất cả đã sửa xong. Bây giờ có thể:
- ✅ Tạo rạp với gán manager
- ✅ Chỉnh sửa manager rạp
- ✅ Hiển thị manager info trên cinema card
- ✅ Lọc cinemas đúng theo chain
