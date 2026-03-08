# Dynamic Role Management System

## 🎯 Tổng Quan

Hệ thống role management đã được refactor để **hoàn toàn dựa trên database** thay vì enum cứng. Điều này cho phép:

✅ **Thêm role mới mà không cần thay đổi code**  
✅ **Quản lý role động thông qua API**  
✅ **Linh hoạt mở rộng hệ thống**  
✅ **Không cần restart server khi thêm role**  

## 🔧 Thay Đổi Chính

### 1. **Loại Bỏ Dependency vào Enum**
- ❌ `RoleName` enum không còn được sử dụng trong business logic
- ✅ Tất cả role checking được thực hiện qua database queries
- ✅ Role validation dựa trên dữ liệu thực tế trong bảng `roles`

### 2. **Dynamic Role Checking**
```java
// Trước đây (cứng):
RoleName.ADMIN.getRoleName().equals(userRole.getRole().getRoleName())

// Bây giờ (linh hoạt):
userRoles.stream()
    .anyMatch(userRole -> {
        String roleName = userRole.getRole().getRoleName();
        return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
    });
```

### 3. **Role Validation**
```java
// Trước đây: RoleName.fromString(request.getRoleName());
// Bây giờ: 
Role role = roleRepository.findByRoleName(request.getRoleName())
    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));
```

## 📊 New API Endpoints

### 1. **Get All Roles**
```http
GET /api/admin/roles
Authorization: Bearer {adminToken}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "roleName": "SYSTEM_ADMIN",
      "description": "System Administrator role with full access",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "roleName": "CUSTOMER",
      "description": "Customer role with standard user access",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. **Add New Role**
```http
POST /api/admin/roles
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "roleName": "MANAGER",
  "description": "Manager role with moderate system access"
}

Response:
{
  "success": true,
  "message": "Role added successfully",
  "data": {
    "id": 4,
    "roleName": "MANAGER",
    "description": "Manager role with moderate system access",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. **Update User Role (Enhanced)**
```http
PUT /api/admin/users/role
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "userId": 5,
  "roleName": "MANAGER"  // Có thể là bất kỳ role nào trong database
}
```

## 🚀 Cách Thêm Role Mới

### Option 1: Via API (Recommended)
```bash
# 1. Login as admin
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@movieticket.com", "password": "Admin123!"}'

# 2. Add new role
curl -X POST "http://localhost:8080/api/admin/roles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "SUPERVISOR",
    "description": "Supervisor role for team management"
  }'

# 3. Assign role to user
curl -X PUT "http://localhost:8080/api/admin/users/role" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 10,
    "roleName": "SUPERVISOR"
  }'
```

### Option 2: Direct Database Insert
```sql
INSERT INTO roles (role_name, description, created_at) 
VALUES ('SUPERVISOR', 'Supervisor role for team management', NOW());
```

## 🔒 Security Configuration

SecurityConfig đã được setup để support dynamic roles:

```java
// Admin endpoints yêu cầu SYSTEM_ADMIN role
.requestMatchers("/api/admin/**").hasRole("SYSTEM_ADMIN")

// Có thể easily mở rộng cho roles khác:
.requestMatchers("/api/manager/**").hasRole("MANAGER")
.requestMatchers("/api/supervisor/**").hasRole("SUPERVISOR")
```

## 🛡️ Admin Role Detection

Hệ thống tự động nhận diện admin roles:

```java
// Support multiple admin role names
public boolean isUserAdmin(Integer userId) {
    return userRoles.stream()
        .anyMatch(userRole -> {
            String roleName = userRole.getRole().getRoleName();
            return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
        });
}
```

## 📋 Database Schema

```sql
-- Roles table
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles mapping
CREATE TABLE user_roles (
  user_role_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);
```

## 🎯 Benefits

1. **Scalability**: Thêm role mới không cần code changes
2. **Flexibility**: Role names có thể customize theo business needs
3. **Maintainability**: Centralized role management qua API
4. **Auditing**: Track được ai assign role cho ai và khi nào
5. **Real-time**: Changes có hiệu lực ngay lập tức

## 🔄 Migration Path

1. **Existing roles** sẽ tiếp tục hoạt động bình thường
2. **RoleName enum** được đánh dấu `@Deprecated` để reference
3. **New development** nên sử dụng database-driven approach
4. **Gradually migrate** existing hardcoded role checks về database queries

## 📝 Example Usage

```java
// Frontend JavaScript
const addNewRole = async (roleName, description) => {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roleName, description })
  });
  
  return response.json();
};

// Usage
await addNewRole('CONTENT_MODERATOR', 'Content moderation role');
await assignRole(userId, 'CONTENT_MODERATOR');
```

## ⚠️ Notes

- Role names được automatically uppercase khi save
- Duplicate role names sẽ bị reject
- Chỉ admin mới có thể add/modify roles
- Role deletion chưa implement (có thể thêm nếu cần)

Hệ thống giờ đây **hoàn toàn dynamic** và ready cho future expansion! 🚀