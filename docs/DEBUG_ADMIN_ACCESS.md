# Debug Instructions - Không vào được Quản lý phim

## Vấn đề
Menu "Quản lý phim" trong Admin Dashboard không click được hoặc chuyển hướng về trang chủ.

## Nguyên nhân
Protected Route yêu cầu role `CINEMA_MANAGER` để truy cập `/admin/*`

## Cách kiểm tra

### 1. Kiểm tra user hiện tại trong browser console:
```javascript
// Mở DevTools (F12) và chạy lệnh này trong Console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current user:', user);
console.log('User roles:', user?.roles);
```

### 2. Kiểm tra kết quả:

**Nếu user = null hoặc undefined:**
- ✅ Bạn chưa đăng nhập
- ➡️ Giải pháp: Đăng nhập với tài khoản có role CINEMA_MANAGER

**Nếu user.roles = ["CUSTOMER"]:**
- ✅ Bạn đăng nhập với user CUSTOMER
- ➡️ Giải pháp: Logout và login lại với tài khoản CINEMA_MANAGER

**Nếu user.roles = ["CINEMA_MANAGER"] hoặc bao gồm "CINEMA_MANAGER":**
- ❌ Có vấn đề khác
- ➡️ Kiểm tra Console có lỗi không

## Giải pháp

### Option 1: Tạo user mới với role CINEMA_MANAGER (Backend)
```sql
-- Trong database, tạo user với role CINEMA_MANAGER
INSERT INTO users (email, password, full_name, role) 
VALUES ('manager@cinema.com', 'hashed_password', 'Cinema Manager', 'CINEMA_MANAGER');
```

### Option 2: Test tạm thời - Tắt protection (CHỈ ĐỂ TEST)

Sửa `App.js` tạm thời:
```javascript
// BEFORE (yêu cầu role):
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={[ROLES.CINEMA_MANAGER]}>
    <AdminLayout />
  </ProtectedRoute>
}>

// AFTER (cho phép tất cả user đã login):
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={[]}>
    <AdminLayout />
  </ProtectedRoute>
}>
```

⚠️ **LƯU Ý**: Option 2 chỉ để test, PHẢI BẬT LẠI protection sau khi test xong!

### Option 3: Update user role trong database
```sql
-- Tìm user hiện tại
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Update role
UPDATE users 
SET role = 'CINEMA_MANAGER' 
WHERE email = 'your-email@example.com';
```

Sau đó logout và login lại.

## Verify sau khi fix

1. Đăng nhập với user có role CINEMA_MANAGER
2. Kiểm tra localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('user')).roles
   // Should include "CINEMA_MANAGER"
   ```
3. Navigate đến http://localhost:3000/admin/dashboard
4. Click vào "Quản lý phim" trong sidebar
5. ✅ Nên chuyển đến http://localhost:3000/admin/movies

## Các lỗi thường gặp

### Lỗi: "Bạn không có quyền truy cập trang này"
- **Nguyên nhân**: User không có role CINEMA_MANAGER
- **Giải pháp**: Update role trong database hoặc login với user khác

### Lỗi: Redirect về trang chủ
- **Nguyên nhân**: ProtectedRoute redirect về dashboard mặc định
- **Giải pháp**: Kiểm tra role của user

### Console Error: "Cannot read property 'roles' of null"
- **Nguyên nhân**: Chưa login hoặc localStorage bị clear
- **Giải pháp**: Login lại

## Quick Test Script

Chạy trong browser console:
```javascript
// Test current protection
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  console.error('❌ Not logged in');
} else if (!user.roles || !user.roles.includes('CINEMA_MANAGER')) {
  console.error('❌ User role:', user.roles, '- Need CINEMA_MANAGER');
} else {
  console.log('✅ User has correct role:', user.roles);
}
```

## Backend API để test

Nếu backend chưa có endpoint tạo CINEMA_MANAGER, thêm:
```java
// AdminController.java
@PostMapping("/test/create-manager")
public ResponseEntity<?> createTestManager() {
    User manager = new User();
    manager.setEmail("manager@test.com");
    manager.setPassword(passwordEncoder.encode("manager123"));
    manager.setFullName("Test Manager");
    manager.setRole(UserRole.CINEMA_MANAGER);
    userRepository.save(manager);
    return ResponseEntity.ok("Manager created");
}
```

Sau đó login với:
- Email: manager@test.com
- Password: manager123
