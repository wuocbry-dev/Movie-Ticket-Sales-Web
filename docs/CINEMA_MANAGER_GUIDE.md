# Hướng Dẫn Phân Quyền Quản Lý Phim

## Tổng Quan

Hệ thống đã được cập nhật để phân quyền rõ ràng giữa các vai trò quản trị:

- **SYSTEM_ADMIN**: Có toàn quyền thêm, sửa, xóa phim
- **CINEMA_MANAGER**: Chỉ được xem danh sách phim (không có quyền chỉnh sửa)

## Thay Đổi Đã Thực Hiện

### 1. Kiểm Tra Quyền Trong Component

File: `src/components/MovieManagement.js`

```javascript
import { hasRole, ROLES } from '../utils/roleUtils';

// Lấy thông tin user từ localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Kiểm tra quyền
const canEdit = hasRole(user.roles, ROLES.SYSTEM_ADMIN);
const canView = hasRole(user.roles, ROLES.CINEMA_MANAGER) || canEdit;
```

### 2. Tiêu Đề Động Theo Quyền

```javascript
// SYSTEM_ADMIN thấy: "Quản Lý Phim"
// CINEMA_MANAGER thấy: "Danh Sách Phim"
<h1>{canEdit ? 'Quản Lý Phim' : 'Danh Sách Phim'}</h1>
```

### 3. Nút "Thêm Phim Mới" Chỉ Hiện Với SYSTEM_ADMIN

```javascript
{canEdit && (
  <button className="btn-primary" onClick={handleCreate}>
    <FaPlus /> Thêm Phim Mới
  </button>
)}
```

### 4. Badge "Chỉ Xem" Cho CINEMA_MANAGER

```javascript
{!canEdit && canView && (
  <div className="view-only-badge">
    <FaEye /> Chỉ xem
  </div>
)}
```

### 5. Nút Sửa/Xóa Chỉ Hiện Với SYSTEM_ADMIN

```javascript
{canEdit && (
  <div className="movie-actions">
    <button className="btn-edit" onClick={() => handleEdit(movie)}>
      <FaEdit /> Sửa
    </button>
    <button className="btn-delete" onClick={() => handleDelete(movie.movieId)}>
      <FaTrash /> Xóa
    </button>
  </div>
)}
```

## Giao Diện Theo Vai Trò

### SYSTEM_ADMIN (Quản Trị Viên Hệ Thống)

```
┌─────────────────────────────────────────┐
│ Quản Lý Phim        [➕ Thêm Phim Mới]  │
├─────────────────────────────────────────┤
│ 🔍 Tìm kiếm...   [Bộ lọc] [Sắp xếp]    │
├─────────────────────────────────────────┤
│ 🎬 Phim 1                               │
│    Status | Rating | Duration           │
│                        [✏️ Sửa] [🗑️ Xóa] │
├─────────────────────────────────────────┤
│ 🎬 Phim 2                               │
│    Status | Rating | Duration           │
│                        [✏️ Sửa] [🗑️ Xóa] │
└─────────────────────────────────────────┘
```

### CINEMA_MANAGER (Quản Lý Rạp)

```
┌─────────────────────────────────────────┐
│ Danh Sách Phim         [👁️ Chỉ xem]     │
├─────────────────────────────────────────┤
│ 🔍 Tìm kiếm...   [Bộ lọc] [Sắp xếp]    │
├─────────────────────────────────────────┤
│ 🎬 Phim 1                               │
│    Status | Rating | Duration           │
│                                         │
├─────────────────────────────────────────┤
│ 🎬 Phim 2                               │
│    Status | Rating | Duration           │
│                                         │
└─────────────────────────────────────────┘
```

## CSS Styles Mới

File: `src/components/MovieManagement.css`

```css
.view-only-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
}
```

## Kiểm Tra Phân Quyền

### Test với SYSTEM_ADMIN

1. Đăng nhập với tài khoản SYSTEM_ADMIN
2. Vào **Quản Lý Phim**
3. Kiểm tra:
   - ✅ Tiêu đề hiện "Quản Lý Phim"
   - ✅ Nút "Thêm Phim Mới" hiển thị
   - ✅ Mỗi phim có nút "Sửa" và "Xóa"

### Test với CINEMA_MANAGER

1. Đăng nhập với tài khoản CINEMA_MANAGER
2. Vào **Danh Sách Phim**
3. Kiểm tra:
   - ✅ Tiêu đề hiện "Danh Sách Phim"
   - ✅ Badge "Chỉ xem" hiển thị
   - ✅ Không có nút "Thêm Phim Mới"
   - ✅ Không có nút "Sửa" và "Xóa" trên mỗi phim

## Logic Phân Quyền

```
SYSTEM_ADMIN:
  canEdit = true
  canView = true
  → Có quyền: Xem, Thêm, Sửa, Xóa

CINEMA_MANAGER:
  canEdit = false
  canView = true
  → Có quyền: Xem
  → Không có quyền: Thêm, Sửa, Xóa

CINEMA_STAFF:
  canEdit = false
  canView = false
  → Không truy cập được trang này
```

## Lưu Ý Quan Trọng

### ⚠️ Bảo Mật Backend

Phân quyền ở frontend chỉ để cải thiện trải nghiệm người dùng. **Bắt buộc phải** kiểm tra quyền ở backend:

```java
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
@PostMapping("/movies")
public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
    // ...
}

@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
@GetMapping("/movies")
public ResponseEntity<List<Movie>> getMovies() {
    // ...
}
```

### 🔧 Khôi Phục Role Protection

File: `src/App.js` có comment:

```javascript
// TEMPORARY: Removed role check for testing. MUST RESTORE LATER!
allowedRoles={[]}
```

Cần đổi lại thành:

```javascript
allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.CINEMA_MANAGER]}
```

## Tài Liệu Tham Khảo

- **PERMISSION_MODEL.md**: Chi tiết đầy đủ về hệ thống phân quyền
- **ROLE_BASED_DASHBOARD_README.md**: Kiến trúc dashboard theo vai trò
- **roleUtils.js**: Các hàm tiện ích kiểm tra quyền

## Câu Hỏi Thường Gặp

**Q: CINEMA_MANAGER có thể xem phim nhưng không thấy gì?**
- Kiểm tra localStorage: `localStorage.getItem('user')`
- Đảm bảo roles đúng format: `["CINEMA_MANAGER"]` hoặc `["ROLE_CINEMA_MANAGER"]`

**Q: Nút vẫn hiện mặc dù không có quyền?**
- Xóa cache trình duyệt
- Đăng xuất và đăng nhập lại
- Kiểm tra console log có lỗi không

**Q: Muốn CINEMA_STAFF cũng xem được?**
- Thêm `|| hasRole(user.roles, ROLES.CINEMA_STAFF)` vào `canView`

---

**Hoàn thành**: Phân quyền quản lý phim theo vai trò
**File đã sửa**: MovieManagement.js, MovieManagement.css
**File tạo mới**: PERMISSION_MODEL.md, CINEMA_MANAGER_GUIDE.md
