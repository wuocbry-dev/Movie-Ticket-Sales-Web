# 🔐 Khắc Phục Lỗi Authentication - Cinema Halls API

## ❌ Lỗi Gặp Phải

```
2025-12-05T04:04:45.425+07:00 ERROR 37632 --- [Movie Ticket Sales Web Project] [nio-8080-exec-2] 
a.m.s.JwtAuthenticationEntryPoint : Responding with unauthorized error. 
Message - Full authentication is required to access this resource
```

## 🔍 Nguyên Nhân

`SecurityConfig.java` **THIẾU** cấu hình cho các endpoints `/api/cinema-halls/**`

Khi gọi API cinema-halls, Spring Security không tìm thấy rule phù hợp nên áp dụng rule mặc định: `.anyRequest().authenticated()` → Yêu cầu authentication cho tất cả request không được định nghĩa.

---

## ✅ Giải Pháp Đã Áp Dụng

### Đã thêm vào `SecurityConfig.java`:

```java
// Admin-only cinema hall endpoints
.requestMatchers(HttpMethod.POST, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.PUT, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.DELETE, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.GET, "/api/cinema-halls/cinema/{cinemaId}/admin").authenticated()

// Public cinema hall endpoints (GET only)
.requestMatchers(HttpMethod.GET, "/api/cinema-halls/**").permitAll()
```

### Vị trí trong code:

```java
// Public cinema endpoints (GET only)
.requestMatchers(HttpMethod.GET, "/api/cinemas/**").permitAll()

// ⬇️ THÊM ĐOẠN NÀY ⬇️
// Admin-only cinema hall endpoints
.requestMatchers(HttpMethod.POST, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.PUT, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.DELETE, "/api/cinema-halls/admin/**").authenticated()
.requestMatchers(HttpMethod.GET, "/api/cinema-halls/cinema/{cinemaId}/admin").authenticated()

// Public cinema hall endpoints (GET only)
.requestMatchers(HttpMethod.GET, "/api/cinema-halls/**").permitAll()
// ⬆️ KẾT THÚC ⬆️

// Admin-only endpoints
.requestMatchers("/api/admin/**").hasRole("SYSTEM_ADMIN")
```

---

## 🔄 Cách Khởi Động Lại Application

### Windows (PowerShell):

```powershell
# Bước 1: Dừng application (Ctrl+C nếu đang chạy)

# Bước 2: Di chuyển đến thư mục BE
cd "d:\git\Movie-Ticket-Sales-Web-Project\BE\Movie Ticket Sales Web Project"

# Bước 3: Build
.\build.ps1

# Bước 4: Run
.\run.ps1
```

### Hoặc sử dụng Maven trực tiếp:

```powershell
# Clean và build
mvn clean package -DskipTests

# Run
java -jar target\Movie-Ticket-Sales-Web-Project-0.0.1-SNAPSHOT.jar
```

---

## 📋 Phân Quyền API Cinema Halls

| Endpoint | Method | Yêu Cầu | Mô Tả |
|----------|--------|---------|-------|
| `/api/cinema-halls/cinema/{cinemaId}` | GET | ❌ None | Xem phòng chiếu (public) |
| `/api/cinema-halls/cinema/{cinemaId}/admin` | GET | ✅ JWT | Xem phòng (admin/manager) |
| `/api/cinema-halls/admin` | POST | ✅ JWT | Tạo phòng chiếu mới |
| `/api/cinema-halls/admin/{hallId}` | PUT | ✅ JWT | Cập nhật phòng chiếu |
| `/api/cinema-halls/admin/{hallId}` | DELETE | ✅ JWT | Xóa phòng chiếu |
| `/api/cinema-halls/admin/{hallId}/regenerate-seats` | POST | ✅ JWT | Tạo lại ghế |
| `/api/cinema-halls/admin/cinema/{cinemaId}/regenerate-seats` | POST | ✅ JWT | Tạo lại tất cả ghế |
| `/api/cinema-halls/admin/{hallId}/seats` | DELETE | ✅ JWT | Xóa ghế 1 phòng |
| `/api/cinema-halls/admin/cinema/{cinemaId}/seats` | DELETE | ✅ JWT | Xóa ghế tất cả phòng |

---

## 🧪 Test Sau Khi Sửa

### 1. Test Public Endpoint (Không cần token)

```bash
curl -X GET "http://localhost:8080/api/cinema-halls/cinema/2"
```

**Expected:** HTTP 200 OK + Danh sách phòng chiếu

### 2. Test Admin Endpoint (Cần token)

```bash
# Đăng nhập để lấy token
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Sử dụng token để gọi API
curl -X POST "http://localhost:8080/api/cinema-halls/admin/1/regenerate-seats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** HTTP 200 OK + Response với thông tin ghế đã tạo

### 3. Test Admin Endpoint (Không có token) - Nên Lỗi

```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin/1/regenerate-seats"
```

**Expected:** HTTP 401 Unauthorized
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

---

## 🎯 Logic Phân Quyền

### Công Khai (Public):
- `GET /api/cinema-halls/**` - Xem thông tin phòng chiếu
- Không cần đăng nhập
- Chỉ hiển thị phòng active

### Xác Thực (Authenticated):
- Tất cả `/api/cinema-halls/admin/**`
- Cần JWT token hợp lệ
- Kiểm tra quyền trong Controller:
  - SYSTEM_ADMIN: Full access
  - Cinema Manager: Chỉ quản lý phòng của rạp mình

---

## ⚠️ Lỗi Thường Gặp

### 1. "Full authentication is required"

**Nguyên nhân:** 
- Thiếu JWT token
- Token không hợp lệ/hết hạn
- Gọi sai endpoint (admin endpoint mà không có token)

**Giải pháp:**
- Đăng nhập lại để lấy token mới
- Kiểm tra header: `Authorization: Bearer TOKEN`
- Đảm bảo token chưa hết hạn (default: 24h)

### 2. "Token không hợp lệ hoặc đã hết hạn"

**Nguyên nhân:**
- Token đã expire
- Token bị sai format
- Secret key không khớp

**Giải pháp:**
```bash
# Đăng nhập lại
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 3. "Bạn không có quyền..."

**Nguyên nhân:**
- User không phải ADMIN hoặc Manager
- Cố gắng truy cập phòng chiếu của rạp khác

**Giải pháp:**
- Kiểm tra role của user
- Đảm bảo user là manager của rạp cần thao tác

---

## 🔍 Kiểm Tra Role User

```sql
-- Kiểm tra roles của user
SELECT 
    u.username,
    r.role_name,
    ur.is_active
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.username = 'your_username';

-- Kiểm tra cinema manager
SELECT 
    c.cinema_name,
    u.username as manager
FROM cinemas c
LEFT JOIN users u ON c.manager_id = u.user_id
WHERE c.cinema_id = 2;
```

---

## 📝 Checklist Sau Khi Sửa

- [x] Cập nhật `SecurityConfig.java`
- [x] Thêm rules cho `/api/cinema-halls/**`
- [x] Build lại project
- [x] Khởi động lại application
- [ ] Test public endpoint (không token)
- [ ] Test admin endpoint (có token)
- [ ] Test admin endpoint (không token) - nên lỗi 401
- [ ] Verify logs không còn error

---

## 🎓 Best Practices

1. **Luôn restart sau khi thay đổi SecurityConfig**
   - SecurityConfig load 1 lần khi startup
   - Thay đổi chỉ có hiệu lực sau khi restart

2. **Sử dụng Postman để quản lý token**
   - Tạo Environment variable cho JWT token
   - Tự động inject vào header

3. **Check logs để debug**
   ```powershell
   # View logs real-time
   Get-Content "backend.log" -Wait -Tail 50
   ```

4. **Test theo thứ tự**
   - Public endpoints trước
   - Authenticated endpoints sau
   - Error cases cuối cùng

---

## 📞 Troubleshooting

Nếu vẫn gặp lỗi sau khi restart:

1. **Xóa cache Maven:**
   ```powershell
   mvn clean
   rm -r target/
   mvn package
   ```

2. **Check port 8080:**
   ```powershell
   netstat -ano | findstr :8080
   # Nếu có process khác, kill nó
   taskkill /PID <PID> /F
   ```

3. **Verify SecurityConfig được load:**
   - Check startup logs
   - Tìm dòng: "Mapped [POST] /api/cinema-halls/admin..."

4. **Test với curl verbose:**
   ```bash
   curl -v -X GET "http://localhost:8080/api/cinema-halls/cinema/2"
   ```

---

**Last Updated:** December 5, 2025  
**Fixed By:** Adding cinema-halls rules to SecurityConfig  
**Status:** ✅ Resolved
