# Hệ Thống Quản Lý Role

## Tổng Quan

Hệ thống đã được cập nhật để hỗ trợ quản lý role với các quyền hạn khác nhau:

- **ADMIN**: Có quyền quản lý tất cả user và thay đổi role
- **STAFF**: Quyền trung gian (có thể mở rộng trong tương lai)
- **CUSTOMER**: Quyền cơ bản của khách hàng

## Các Thay Đổi

### 1. Backend Changes

#### DTOs
- **UserInfo**: Thêm field `roles` (List<String>)
- **RegisterResponse**: Thêm field `roles` (List<String>)
- **UpdateUserRoleRequest**: DTO mới để cập nhật role

#### Services
- **RoleManagementService**: Service mới để quản lý role
  - `isUserAdmin()`: Kiểm tra user có role admin
  - `getAllUsersWithRoles()`: Lấy danh sách user (chỉ admin)
  - `updateUserRole()`: Cập nhật role user (chỉ admin)

#### Controllers
- **AdminController**: Controller mới cho admin functions
  - `GET /api/admin/users`: Lấy danh sách tất cả user
  - `PUT /api/admin/users/role`: Cập nhật role user
- **AuthController**: Thêm endpoint
  - `GET /api/auth/check-admin`: Kiểm tra user hiện tại có phải admin

#### Enums
- **RoleName**: Enum định nghĩa các role có sẵn

### 2. API Endpoints

#### Authentication
```
POST /api/auth/login
Response: {
  "success": true,
  "data": {
    "accessToken": "...",
    "user": {
      "userId": 1,
      "email": "user@example.com",
      "roles": ["CUSTOMER"]
    }
  }
}

GET /api/auth/check-admin
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "data": true/false
}
```

#### Admin Functions (Chỉ Admin)
```
GET /api/admin/users
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "data": [
    {
      "userId": 1,
      "email": "user@example.com",
      "fullName": "User Name",
      "roles": ["CUSTOMER"]
    }
  ]
}

PUT /api/admin/users/role
Headers: Authorization: Bearer <token>
Body: {
  "userId": 1,
  "roleName": "ADMIN"
}
```

### 3. Database Setup

Chạy script `setup_admin_role.sql` để:
- Tạo các role cơ bản (ADMIN, STAFF, CUSTOMER)
- Tạo user admin mặc định
- Setup membership cho admin

```sql
-- User admin mặc định
Email: admin@movieticket.com
Password: Admin123!
```

### 4. Frontend Integration

#### Lưu trữ role info
```javascript
// Sau khi login thành công
const loginResponse = await api.post('/auth/login', credentials);
const userInfo = loginResponse.data.data.user;

// Lưu role info
localStorage.setItem('userRoles', JSON.stringify(userInfo.roles));

// Kiểm tra admin
const isAdmin = userInfo.roles.includes('ADMIN');
```

#### Kiểm tra quyền
```javascript
// Utility functions
const isAdmin = () => {
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  return roles.includes('ADMIN');
};

const hasRole = (roleName) => {
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  return roles.includes(roleName);
};

// Conditional rendering
{isAdmin() && (
  <AdminPanel />
)}
```

#### Route Protection
```javascript
// React Router example
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### 5. Security Features

- **Token-based Authentication**: Mỗi API call cần JWT token
- **Role-based Authorization**: Kiểm tra role trước khi thực hiện action
- **Admin-only Operations**: Chỉ admin mới có thể quản lý user và role
- **Automatic Role Assignment**: User mới tự động được gán role CUSTOMER

### 6. Next Steps

1. **Frontend Implementation**:
   - Cập nhật login component để xử lý role
   - Tạo admin dashboard
   - Implement role-based routing
   - Add role management UI

2. **Enhanced Security**:
   - Thêm rate limiting
   - Audit logging cho role changes
   - Password complexity requirements

3. **Role Expansion**:
   - Thêm permissions chi tiết hơn
   - Role hierarchy
   - Temporary role assignments

## Testing

### Test Admin Functions
```bash
# 1. Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@movieticket.com", "password": "Admin123!"}'

# 2. Get all users (with admin token)
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer <admin_token>"

# 3. Update user role
curl -X PUT http://localhost:8080/api/admin/users/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "roleName": "STAFF"}'
```