# 🎭 Role-Based Dashboard - Quick Start

## ✅ Đã Hoàn Thành

Hệ thống Role-Based Dashboard đã được implement với các tính năng:

### 🔐 **Auto-Redirect sau khi Login**
- **CUSTOMER** → Trang chủ `/`
- **CINEMA_STAFF** → `/staff/dashboard`
- **CINEMA_MANAGER** → `/admin/dashboard`
- **SYSTEM_ADMIN** → `/system-admin/dashboard`

### 🛡️ **Protected Routes**
Tất cả các route quản lý đã được bảo vệ:
- Chỉ CINEMA_STAFF mới truy cập được `/staff/*`
- Chỉ CINEMA_MANAGER mới truy cập được `/admin/*`
- Chỉ SYSTEM_ADMIN mới truy cập được `/system-admin/*`

### 📱 **Dynamic Header Menu**
- Hiển thị vai trò trong user dropdown
- Link nhanh đến dashboard tương ứng (chỉ cho staff/admin)
- Icon dashboard với tên role

## 🧪 Test Ngay

### 1. Test với Backend đang chạy
```bash
# Backend phải chạy ở http://localhost:8080
```

### 2. Login với các role khác nhau

**Test CUSTOMER:**
```json
Email: customer@example.com
→ Redirect to: /
→ Header shows: "Hạng: BRONZE" + points
→ No dashboard link
```

**Test CINEMA_STAFF:**
```json
Email: staff@example.com
→ Redirect to: /staff/dashboard
→ Header shows: "Vai trò: Nhân viên"
→ Dashboard link: "Nhân viên Dashboard"
```

**Test CINEMA_MANAGER:**
```json
Email: manager@example.com
→ Redirect to: /admin/dashboard
→ Header shows: "Vai trò: Quản lý rạp"
→ Dashboard link: "Quản lý rạp Dashboard"
```

**Test SYSTEM_ADMIN:**
```json
Email: admin@example.com
→ Redirect to: /system-admin/dashboard
→ Header shows: "Vai trò: Quản trị hệ thống"
→ Dashboard link: "Quản trị hệ thống Dashboard"
```

### 3. Test Unauthorized Access

Thử truy cập URL trực tiếp:
```
Customer login → visit /admin/dashboard
Expected:
✅ Toast: "Bạn không có quyền truy cập trang này"
✅ Redirect to: /
```

## 📂 Files Đã Tạo/Sửa

### Mới tạo:
- ✅ `src/utils/roleUtils.js` - Utility functions cho role management
- ✅ `src/components/ProtectedRoute.js` - Component bảo vệ routes
- ✅ `docs/ROLE_BASED_DASHBOARD_GUIDE.md` - Tài liệu chi tiết

### Đã sửa:
- ✅ `src/App.js` - Thêm ProtectedRoute cho các routes
- ✅ `src/components/LoginForm.js` - Auto-redirect theo role
- ✅ `src/components/Header.js` - Hiển thị role và dashboard link

## 🎯 Login Response Structure

Backend trả về:
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "userId": 13,
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "roles": ["CUSTOMER"]  // hoặc ["CINEMA_STAFF"], ["CINEMA_MANAGER"], ["SYSTEM_ADMIN"]
    }
  }
}
```

## 🔄 Priority của Multiple Roles

Nếu user có nhiều roles:
```
["CUSTOMER", "CINEMA_MANAGER"] → Go to /admin/dashboard
["CINEMA_STAFF", "SYSTEM_ADMIN"] → Go to /system-admin/dashboard

Priority: SYSTEM_ADMIN > CINEMA_MANAGER > CINEMA_STAFF > CUSTOMER
```

## 🚀 Chạy Ứng Dụng

```bash
# Frontend
cd FE/my-app
npm start
# → http://localhost:3000

# Backend (trong terminal khác)
cd BE/Movie Ticket Sales Web Project
./mvnw spring-boot:run
# → http://localhost:8080
```

## 🎨 UI Changes

### Header Dropdown:
```
┌─────────────────────────┐
│ Nguyen Van A            │
│ user@example.com        │
│ Vai trò: Quản lý rạp    │  ← Role display
├─────────────────────────┤
│ 👤 Thông tin cá nhân    │
│ 🎬 Lịch sử đặt vé       │
├─────────────────────────┤
│ 📊 Quản lý rạp Dashboard│  ← Dashboard link (staff only)
├─────────────────────────┤
│ 🚪 Đăng xuất            │
└─────────────────────────┘
```

## ⚡ Quick Commands

```javascript
// Import utils
import { getDashboardPath, hasRole, isStaffMember } from '../utils/roleUtils';

// Get dashboard path
const path = getDashboardPath(user.roles);

// Check role
if (hasRole(user.roles, 'CINEMA_MANAGER')) {
  // Do something
}

// Check if staff
if (isStaffMember(user.roles)) {
  // Show staff menu
}
```

## 📖 Tài Liệu Đầy Đủ

Xem: `docs/ROLE_BASED_DASHBOARD_GUIDE.md`

## ✨ Features Highlight

- ✅ Auto-redirect dựa trên role sau login
- ✅ Protected routes với role-based access control
- ✅ Dynamic header menu theo role
- ✅ Multiple roles support với priority system
- ✅ Unauthorized access handling
- ✅ User-friendly error messages
- ✅ Reusable utility functions
- ✅ Type-safe role constants

---

**Status**: ✅ Ready for Testing  
**Version**: 1.0  
**Date**: November 11, 2025
