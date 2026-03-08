# Role-Based Dashboard System

## 📋 Tổng Quan

Hệ thống Role-Based Dashboard tự động chuyển hướng người dùng đến dashboard phù hợp sau khi đăng nhập dựa trên vai trò (role) của họ.

## 🎯 Các Role và Dashboard Tương Ứng

### 1. **CUSTOMER** (Khách hàng)
- **Dashboard**: Trang chủ `/`
- **Quyền truy cập**: 
  - Xem phim, đặt vé
  - Quản lý thông tin cá nhân
  - Xem lịch sử đặt vé
  - Tích điểm thành viên

### 2. **CINEMA_STAFF** (Nhân viên rạp)
- **Dashboard**: `/staff/dashboard`
- **Quyền truy cập**:
  - Bán vé tại quầy
  - Xác nhận vé
  - Bán đồ ăn
  - Xem lịch chiếu
  - Xử lý hoàn vé

### 3. **CINEMA_MANAGER** (Quản lý rạp)
- **Dashboard**: `/admin/dashboard`
- **Quyền truy cập**:
  - Quản lý phim
  - Quản lý rạp
  - Quản lý suất chiếu
  - Quản lý đặt vé
  - Quản lý khách hàng
  - Quản lý khuyến mãi
  - Báo cáo & thống kê

### 4. **SYSTEM_ADMIN** (Quản trị hệ thống)
- **Dashboard**: `/system-admin/dashboard`
- **Quyền truy cập**:
  - Quản lý toàn bộ hệ thống rạp
  - Quản lý tài khoản
  - Quản lý nhân viên
  - Quản lý cấu hình hệ thống
  - Nhật ký hệ thống
  - Thông báo hệ thống

## 📝 Cấu Trúc Dữ Liệu Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "userId": 13,
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "membershipTier": "BRONZE",
      "availablePoints": 0,
      "roles": ["CUSTOMER", "CINEMA_STAFF"]
    }
  }
}
```

## 🔄 Quy Trình Chuyển Hướng

### 1. **Sau khi đăng nhập thành công**

```javascript
// LoginForm.js tự động xử lý
const dashboardPath = getDashboardPath(user.roles);
// Ví dụ: ["CINEMA_MANAGER"] -> "/admin/dashboard"
navigate(dashboardPath);
```

### 2. **Thứ tự ưu tiên Role**

Nếu user có nhiều role, hệ thống chọn role cao nhất theo thứ tự:

1. **SYSTEM_ADMIN** (cao nhất)
2. **CINEMA_MANAGER**
3. **CINEMA_STAFF**
4. **CUSTOMER** (thấp nhất)

Ví dụ:
- User có roles: `["CUSTOMER", "CINEMA_MANAGER"]` → Chuyển đến `/admin/dashboard`
- User có roles: `["CINEMA_STAFF", "SYSTEM_ADMIN"]` → Chuyển đến `/system-admin/dashboard`

## 🛡️ Bảo Vệ Route (Protected Routes)

### Cách sử dụng ProtectedRoute

```javascript
// Trong App.js
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/roleUtils';

// Bảo vệ route chỉ cho CINEMA_MANAGER
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={[ROLES.CINEMA_MANAGER]}>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
</Route>

// Bảo vệ route cho tất cả user đã đăng nhập
<Route path="/profile" element={
  <ProtectedRoute allowedRoles={[]}>
    <ProfilePage />
  </ProtectedRoute>
} />
```

### Xử lý khi không có quyền

Khi user cố truy cập route không có quyền:
1. Hiển thị thông báo lỗi
2. Tự động chuyển về dashboard phù hợp với role của user

## 🔧 Utility Functions

### 1. `getDashboardPath(roles)`
Trả về đường dẫn dashboard phù hợp với role

```javascript
import { getDashboardPath } from '../utils/roleUtils';

const path = getDashboardPath(['CINEMA_MANAGER']);
// Kết quả: "/admin/dashboard"
```

### 2. `getHighestRole(roles)`
Trả về role cao nhất trong danh sách roles

```javascript
import { getHighestRole } from '../utils/roleUtils';

const role = getHighestRole(['CUSTOMER', 'CINEMA_STAFF']);
// Kết quả: "CINEMA_STAFF"
```

### 3. `hasRole(userRoles, requiredRole)`
Kiểm tra user có role cụ thể

```javascript
import { hasRole } from '../utils/roleUtils';

const canAccess = hasRole(user.roles, 'CINEMA_MANAGER');
// true hoặc false
```

### 4. `hasAnyRole(userRoles, requiredRoles)`
Kiểm tra user có bất kỳ role nào trong danh sách

```javascript
import { hasAnyRole } from '../utils/roleUtils';

const isStaff = hasAnyRole(user.roles, ['CINEMA_STAFF', 'CINEMA_MANAGER']);
```

### 5. `isStaffMember(roles)`
Kiểm tra user có phải là nhân viên không

```javascript
import { isStaffMember } from '../utils/roleUtils';

if (isStaffMember(user.roles)) {
  // Show staff menu
}
```

### 6. `getRoleDisplayName(role)`
Lấy tên hiển thị của role

```javascript
import { getRoleDisplayName } from '../utils/roleUtils';

const displayName = getRoleDisplayName('CINEMA_MANAGER');
// Kết quả: "Quản lý rạp"
```

## 📱 Hiển thị Dashboard Link trong Header

Header tự động hiển thị link đến dashboard phù hợp với role của user:

```javascript
// Header.js
{user.roles && isStaffMember(user.roles) && (
  <Link to={getDashboardPath(user.roles)} className="dropdown-item admin-link">
    <FaTachometerAlt /> {getRoleDisplayName(getHighestRole(user.roles))} Dashboard
  </Link>
)}
```

## 🎨 Styling cho Role-Based UI

### CSS cho admin link
```css
.dropdown-item.admin-link {
  color: #ff4b2b;
  font-weight: 600;
  background: rgba(255, 75, 43, 0.1);
}

.dropdown-item.admin-link:hover {
  background: rgba(255, 75, 43, 0.2);
}
```

## 🧪 Test Cases

### Test 1: CUSTOMER Login
```
Input: { roles: ["CUSTOMER"] }
Expected: Redirect to "/"
Display: "Vai trò: Khách hàng"
```

### Test 2: CINEMA_STAFF Login
```
Input: { roles: ["CINEMA_STAFF"] }
Expected: Redirect to "/staff/dashboard"
Display: "Vai trò: Nhân viên"
Dashboard Link: Visible
```

### Test 3: CINEMA_MANAGER Login
```
Input: { roles: ["CINEMA_MANAGER"] }
Expected: Redirect to "/admin/dashboard"
Display: "Vai trò: Quản lý rạp"
Dashboard Link: Visible
```

### Test 4: SYSTEM_ADMIN Login
```
Input: { roles: ["SYSTEM_ADMIN"] }
Expected: Redirect to "/system-admin/dashboard"
Display: "Vai trò: Quản trị hệ thống"
Dashboard Link: Visible
```

### Test 5: Multiple Roles
```
Input: { roles: ["CUSTOMER", "CINEMA_MANAGER", "CINEMA_STAFF"] }
Expected: Redirect to "/admin/dashboard" (highest priority)
Display: "Vai trò: Quản lý rạp"
```

### Test 6: Unauthorized Access
```
Action: CUSTOMER tries to access "/admin/dashboard"
Expected: 
- Toast: "Bạn không có quyền truy cập trang này"
- Redirect to "/"
```

## 📊 Flow Chart

```
Login Success
    ↓
Check user.roles
    ↓
    ├─ Contains SYSTEM_ADMIN? → /system-admin/dashboard
    ├─ Contains CINEMA_MANAGER? → /admin/dashboard
    ├─ Contains CINEMA_STAFF? → /staff/dashboard
    └─ Default (CUSTOMER) → /
```

## 🚀 Hướng Dẫn Sử Dụng

### Cho Developer

1. **Thêm route mới có bảo vệ**:
```javascript
<Route path="/new-feature" element={
  <ProtectedRoute allowedRoles={[ROLES.CINEMA_MANAGER]}>
    <NewFeature />
  </ProtectedRoute>
} />
```

2. **Kiểm tra role trong component**:
```javascript
import { hasRole } from '../utils/roleUtils';

const MyComponent = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (hasRole(user.roles, 'CINEMA_MANAGER')) {
    return <AdminView />;
  }
  return <CustomerView />;
};
```

### Cho Tester

1. **Test với mỗi role**:
   - Đăng nhập với từng role
   - Verify redirect đúng dashboard
   - Verify hiển thị đúng menu

2. **Test unauthorized access**:
   - Thử truy cập URL trực tiếp không có quyền
   - Verify thông báo lỗi
   - Verify redirect về dashboard phù hợp

3. **Test multiple roles**:
   - Đăng nhập với user có nhiều role
   - Verify chọn role ưu tiên cao nhất

## ⚠️ Lưu Ý

1. **Token expiration**: Access token hết hạn sau 3600s (1 giờ), refresh token sau 86400s (24 giờ)
2. **Role changes**: Nếu role thay đổi trên server, user cần logout và login lại
3. **localStorage**: User data lưu trong localStorage, cần xóa khi logout
4. **Cookies**: Tokens lưu trong cookies, tự động gửi trong mỗi API request

## 🔐 Security

- Routes được bảo vệ bằng ProtectedRoute component
- Token được lưu trong HTTP-only cookies (nếu backend hỗ trợ)
- User data được validate trước khi sử dụng
- Tự động logout nếu token invalid

## 📞 Support

Nếu gặp vấn đề:
1. Check console.log để debug
2. Verify user data trong localStorage
3. Check network tab để xem API response
4. Verify routes trong App.js

---

**Version**: 1.0  
**Last Updated**: November 11, 2025  
**Author**: Development Team
