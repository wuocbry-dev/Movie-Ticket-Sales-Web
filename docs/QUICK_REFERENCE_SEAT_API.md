# 🎫 Quick Reference - Seat Management API

## 📌 API Endpoints Overview

### 🔵 CREATE/REGENERATE Operations

| Endpoint | Method | Description | Auto Create Seats |
|----------|--------|-------------|-------------------|
| `/api/cinema-halls/admin` | POST | Tạo phòng chiếu mới | ✅ YES |
| `/api/cinema-halls/admin/{hallId}` | PUT | Cập nhật phòng chiếu | ✅ YES (nếu thay đổi config) |
| `/api/cinema-halls/admin/{hallId}/regenerate-seats` | POST | Tạo lại ghế cho 1 phòng | ✅ YES |
| `/api/cinema-halls/admin/cinema/{cinemaId}/regenerate-seats` | POST | Tạo lại ghế cho tất cả phòng | ✅ YES |

### 🔴 DELETE Operations

| Endpoint | Method | Description | Impact |
|----------|--------|-------------|--------|
| `/api/cinema-halls/admin/{hallId}/seats` | DELETE | Xóa ghế của 1 phòng | ⚠️ Xóa tất cả ghế |
| `/api/cinema-halls/admin/cinema/{cinemaId}/seats` | DELETE | Xóa ghế của tất cả phòng | ⚠️ Xóa tất cả ghế trong rạp |
| `/api/cinema-halls/admin/{hallId}` | DELETE | Xóa phòng chiếu (soft) | ℹ️ Không xóa ghế |

---

## 🚀 Quick Commands

### Xóa ghế 1 phòng
```bash
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/1/seats" \
  -H "Authorization: Bearer TOKEN"
```

### Xóa ghế tất cả phòng trong rạp
```bash
curl -X DELETE "http://localhost:8080/api/cinema-halls/admin/cinema/2/seats" \
  -H "Authorization: Bearer TOKEN"
```

### Tạo lại ghế 1 phòng
```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin/1/regenerate-seats" \
  -H "Authorization: Bearer TOKEN"
```

### Tạo lại ghế tất cả phòng
```bash
curl -X POST "http://localhost:8080/api/cinema-halls/admin/cinema/2/regenerate-seats" \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Response Examples

### Success - Delete
```json
{
  "success": true,
  "message": "Xóa ghế thành công",
  "data": "Đã xóa 80 ghế khỏi phòng chiếu Phòng VIP 1"
}
```

### Success - Regenerate
```json
{
  "success": true,
  "message": "Tạo lại ghế thành công",
  "data": "Đã tạo 320 ghế cho 4 phòng chiếu"
}
```

### Error - No Permission
```json
{
  "success": false,
  "message": "Bạn không có quyền xóa ghế của phòng chiếu này"
}
```

### Error - Not Found
```json
{
  "success": false,
  "message": "Phòng chiếu không tồn tại"
}
```

### Error - Already Empty
```json
{
  "success": false,
  "message": "Phòng chiếu không có ghế nào để xóa"
}
```

---

## 🔐 Authorization

**Required:** JWT Token trong header `Authorization: Bearer TOKEN`

**Roles:** SYSTEM_ADMIN hoặc Cinema Manager

**Get Token:**
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🎯 Use Cases

| Scenario | Recommended API | Notes |
|----------|----------------|-------|
| Thay đổi số hàng/ghế | PUT `/admin/{hallId}` | Tự động regenerate |
| Reset ghế hoàn toàn | DELETE + POST regenerate | 2 API calls |
| Tạo phòng mới | POST `/admin` | Tự động tạo ghế |
| Dọn dẹp dữ liệu test | DELETE `/cinema/{cinemaId}/seats` | Xóa tất cả |
| Phòng ngưng hoạt động | DELETE `/admin/{hallId}/seats` | Xóa ghế, giữ config |

---

## ⚡ Performance

- **Batch Operations:** Sử dụng `saveAll()` cho hiệu suất cao
- **Transaction:** Tất cả operations đều có `@Transactional`
- **Rollback:** Tự động rollback nếu có lỗi
- **Logging:** Mọi thao tác đều được log

---

## 🔍 SQL Quick Check

```sql
-- Tổng số ghế
SELECT COUNT(*) FROM seats;

-- Ghế theo phòng
SELECT hall_id, COUNT(*) as seats 
FROM seats 
GROUP BY hall_id;

-- Ghế theo loại
SELECT seat_type, COUNT(*) 
FROM seats 
GROUP BY seat_type;

-- Phòng chưa có ghế
SELECT h.hall_id, h.hall_name 
FROM cinema_halls h 
LEFT JOIN seats s ON h.hall_id = s.hall_id 
WHERE s.seat_id IS NULL;
```

---

## 📝 HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 OK | Success | Operation completed |
| 201 Created | Created | New hall with seats created |
| 400 Bad Request | Invalid | Missing params or validation error |
| 401 Unauthorized | No auth | Invalid or missing JWT token |
| 403 Forbidden | No permission | User not admin/manager |
| 404 Not Found | Not exists | Hall/Cinema not found |
| 500 Server Error | Exception | Unexpected error |

---

## 🛡️ Safety Checklist

Before deleting seats:
- [ ] Check active showtimes
- [ ] Check pending bookings
- [ ] Backup data if needed
- [ ] Test on development first
- [ ] Verify user has permission
- [ ] Off-peak hours recommended

---

## 📚 Documentation Files

1. **SEAT_GENERATION_GUIDE.md** - Hướng dẫn chi tiết
2. **SEAT_MANAGEMENT_EXAMPLES.md** - Ví dụ thực tế
3. **check_seats.sql** - SQL queries kiểm tra
4. **QUICK_REFERENCE_SEAT_API.md** - Tài liệu này

---

## 💡 Tips

- Sử dụng Postman Collection để test nhanh
- Import file `Cinema_CRUD_Postman_Collection.json`
- Lưu JWT token vào Postman Environment
- Check logs tại `target/*.log` nếu có lỗi
- Dùng SQL queries để verify kết quả

---

## 🔄 Workflow Diagrams

### Create Hall → Auto Create Seats
```
POST /admin 
  → Validate 
  → Save Hall 
  → Generate Seats (auto) 
  → Return Hall + Seat Count
```

### Update Hall Config → Auto Regenerate
```
PUT /admin/{id}
  → Check if config changed
  → Delete old seats
  → Generate new seats
  → Return updated hall
```

### Delete Seats Only
```
DELETE /admin/{id}/seats
  → Validate permission
  → Count seats
  → Delete all
  → Return deleted count
```

### Regenerate Seats
```
POST /admin/{id}/regenerate-seats
  → Delete old seats
  → Generate new seats
  → Return new seat count
```

---

**Last Updated:** December 5, 2025
**Version:** 2.0
**Author:** Movie Ticket Sales System
