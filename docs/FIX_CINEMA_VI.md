# Hướng Dẫn Fix Lọc Rạp Theo Chuỗi

## Vấn Đề

Khi bấm "Quản Lý Rạp" trên một chuỗi rạp, tất cả các rạp đều hiển thị thay vì chỉ hiển thị rạp của chuỗi đó.

**Ví dụ**:
- Bấm "Quản Lý Rạp" trên Cinestar → Hiển thị CGV, BHD Star, Cinestar
- Phải chỉ hiển thị rạp Cinestar thôi

## Nguyên Nhân

Các rạp trong database có `chain_id = NULL` vì:
- Rạp được tạo trước khi thêm cột `chain_id`
- Dữ liệu không được gán `chain_id` khi import/migrate

## Cách Fix - Dùng SQL

### Bước 1: Chạy Script SQL

Mở MySQL/Database client và chạy các lệnh sau:

```sql
-- Gán rạp CGV
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cgv%' AND chain_id IS NULL;

-- Gán rạp Cinestar
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cinestar' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cinestar%' AND chain_id IS NULL;

-- Gán rạp BHD Star
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'bhd star' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%bhd%' AND chain_id IS NULL;
```

### Bước 2: Kiểm Tra Dữ Liệu

```sql
-- Kiểm tra các rạp đã được gán chain_id
SELECT cinema_id, cinema_name, chain_id FROM cinemas WHERE chain_id IS NOT NULL;

-- Kiểm tra có rạp nào chưa được gán?
SELECT COUNT(*) FROM cinemas WHERE chain_id IS NULL;
```

Nếu `COUNT(*) = 0` → Tất cả rạp đã được gán ✅

### Bước 3: Restart Backend

- Dừng backend application
- Khởi động lại backend application

### Bước 4: Test Trong UI

1. Đăng nhập với tài khoản SYSTEM_ADMIN
2. Vào **Quản Lý Chuỗi Rạp** (Cinema Chain Management)
3. Bấm **Quản Lý Rạp** trên từng chuỗi
4. Kiểm tra xem rạp đã lọc đúng chưa

**Kết quả mong đợi**:
- ✅ Bấm Cinestar → Chỉ hiển thị rạp Cinestar
- ✅ Bấm CGV → Chỉ hiển thị rạp CGV
- ✅ Bấm BHD Star → Chỉ hiển thị rạp BHD Star

## Nếu Vẫn Không Hoạt Động

### Debug Bước 1: Kiểm tra API

```bash
# Gọi API debug để xem tất cả rạp
GET http://localhost:8080/api/cinemas/debug/all?page=0&size=100
Authorization: Bearer {token}
```

Kiểm tra response xem tất cả rạp có `chain_id` không

### Debug Bước 2: Kiểm tra Logs

Mở backend application logs, tìm dòng:
```
DEBUG: Found X cinemas for chain Y
DEBUG: Cinema: id=Z, name=..., chainId=...
```

Nếu không thấy → Có lỗi ở backend

### Debug Bước 3: Kiểm tra Database Trực Tiếp

```sql
-- Xem rạp CGV, chain_id phải là bao nhiêu?
SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv';

-- Kiểm tra rạp CGV trong database
SELECT * FROM cinemas WHERE LOWER(cinema_name) LIKE '%cgv%';

-- Xem tất cả mối liên kết
SELECT c.cinema_id, c.cinema_name, c.chain_id, ch.chain_name 
FROM cinemas c 
LEFT JOIN cinema_chains ch ON c.chain_id = ch.chain_id 
ORDER BY c.chain_id;
```

## Các Tệp Cần

### SQL Scripts
- **docs/fix_cinema_chain_data.sql** - Script fix dữ liệu
- **docs/add_manager_to_cinema.sql** - Thêm cột manager_id

### Tài Liệu
- **docs/FIX_CINEMA_FILTERING.md** - Hướng dẫn chi tiết
- **docs/CINEMA_CHAIN_FILTERING_GUIDE.md** - Hướng dẫn kỹ thuật

## Các Tính Năng Mới

### 1. Gán Người Quản Lý Rạp

**Khi tạo rạp mới**:
```
1. Bấm "Thêm Rạp Mới"
2. Điền thông tin rạp
3. Chọn "Người Quản Lý" từ dropdown
4. Bấm "Tạo Rạp"
```

**Mỗi rạp được gán cho 1 CINEMA_MANAGER**:
- Quản lý rạp cụ thể đó
- Chỉ xem được rạp của mình
- Có thể cập nhật thông tin rạp

### 2. Hiển Thị Thông Tin Quản Lý

Trên mỗi thẻ rạp hiển thị:
```
Tên Rạp
Địa chỉ
Điện thoại
Email
👤 Người Quản Lý: [Tên Manager] ([Email])
```

### 3. Sửa Gán Người Quản Lý

**Bấm Edit trên rạp**:
1. Dropdown "Người Quản Lý" pre-select manager hiện tại
2. Có thể thay đổi manager
3. Lưu thay đổi

## Kiểm Tra Hoàn Thành

- [ ] Chạy SQL script fix dữ liệu
- [ ] Kiểm tra database: không có `chain_id = NULL`
- [ ] Restart backend
- [ ] Kiểm tra filtering hoạt động
- [ ] Kiểm tra manager selection
- [ ] Kiểm tra manager hiển thị trên card
- [ ] Xem không có lỗi trong browser
- [ ] Xem không có lỗi trong backend logs

## Liên Hệ/Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra file `docs/FIX_CINEMA_FILTERING.md` chi tiết hơn
2. Xem backend logs
3. Chạy query kiểm tra database
4. Sử dụng endpoint `/api/cinemas/debug/all` debug

---

**Lưu ý**: Tất cả các rạp mới tạo phải có `chain_id` được gán!
