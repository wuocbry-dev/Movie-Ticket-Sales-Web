# Form Đăng Nhập React

## Đã tạo

✅ **Component LoginForm** (`src/components/LoginForm.js`)
- Form đăng nhập với validation
- Toggle hiển thị/ẩn mật khẩu
- Checkbox "Lưu mật khẩu"
- Tab chuyển đổi giữa Đăng nhập / Đăng ký
- Tích hợp react-hook-form + yup validation
- Toast notifications

✅ **Styling** (`src/components/LoginForm.css`)
- Thiết kế giống ảnh mẫu
- Responsive design
- Animations và transitions

✅ **Services**
- `src/services/api.js` - Axios instance với interceptors
- `src/services/authService.js` - Các function xử lý authentication

## Thư viện đã cài đặt

- ✅ react-hook-form - Quản lý form
- ✅ yup - Validation schema
- ✅ @hookform/resolvers - Kết nối yup với react-hook-form
- ✅ axios - HTTP client
- ✅ react-toastify - Thông báo
- ✅ js-cookie - Quản lý cookies
- ✅ jwt-decode - Decode JWT token
- ✅ react-icons - Icons
- ✅ react-router-dom - Routing

## Chạy ứng dụng

```bash
cd "d:\du an dkhanh\Movie-Ticket-Sales-Web-Project-main\FE\my-app"
npm start
```

## Cấu hình Backend

Trong file `src/components/LoginForm.js` và `src/services/api.js`, thay đổi URL backend:

```javascript
// Hiện tại
baseURL: 'http://localhost:8080/api'

// Thay đổi theo backend của bạn
```

## Tính năng

1. **Validation**
   - Email: Bắt buộc, phải đúng định dạng
   - Mật khẩu: Bắt buộc, tối thiểu 6 ký tự
   - Hiển thị lỗi real-time

2. **Security**
   - Token được lưu trong cookies
   - Tự động thêm Bearer token vào headers
   - Xử lý 401 (unauthorized) tự động

3. **UX**
   - Loading state khi đăng nhập
   - Toast notifications
   - Toggle show/hide password
   - Remember me checkbox

## Tùy chỉnh

### Thay đổi màu chủ đạo

Trong `LoginForm.css`, tìm và thay đổi:

```css
/* Màu xanh dương chủ đạo */
.tab.active {
  background: #0099ff; /* Thay đổi ở đây */
}

.submit-button {
  background: #0099ff; /* Và ở đây */
}
```

### Thêm fields khác

Trong `LoginForm.js`, thêm vào schema:

```javascript
const loginSchema = yup.object().shape({
  email: yup.string()...
  password: yup.string()...
  // Thêm field mới
  phoneNumber: yup.string().required('Số điện thoại là bắt buộc'),
});
```

## API Endpoints (cần tạo ở Backend)

```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: {...} }

POST /api/auth/register
Body: { email, password, fullName, ... }
Response: { token: string, user: {...} }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user: {...} }
```

## Lưu ý

- ⚠️ Cần cấu hình CORS ở backend để cho phép frontend gọi API
- ⚠️ Thay đổi URL API trong `api.js` theo backend thực tế
- ⚠️ Backend cần implement các endpoints tương ứng
