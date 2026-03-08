# Dashboard Quản Lý Phim

## Tổng quan
Dashboard quản lý rạp phim với đầy đủ chức năng CRUD (Create, Read, Update, Delete) cho việc quản lý phim.

## Tính năng chính

### 1. Xem danh sách phim
- Hiển thị dạng lưới (grid) với poster và thông tin cơ bản
- Phân trang linh hoạt (12, 24, 48 phim/trang)
- Hiển thị tổng số phim

### 2. Tìm kiếm & Lọc
- **Tìm kiếm**: Tìm theo tên phim (tiếng Việt hoặc tiếng Anh)
- **Lọc trạng thái**: 
  - Tất cả
  - Đang chiếu (NOW_SHOWING)
  - Sắp chiếu (COMING_SOON)
- **Sắp xếp theo**:
  - Ngày phát hành
  - Tên phim
  - Độ phổ biến
- **Thay đổi số lượng hiển thị**: 12/24/48 phim mỗi trang

### 3. Thêm phim mới
Nhấn nút **"Thêm Phim Mới"** để mở form với các trường:

#### Thông tin cơ bản
- Tên phim (Tiếng Việt) *
- Tên phim (Tiếng Anh) *
- Thời lượng (phút) *
- Độ tuổi (P, K, T13, T16, T18, C) *
- Ngày phát hành *
- Ngày kết thúc
- Trạng thái (Đang chiếu/Sắp chiếu) *
- Phim nổi bật (checkbox)

#### Nội dung phim
- Nội dung (Tiếng Việt) *
- Nội dung (Tiếng Anh)
- Cảnh báo nội dung

#### Thể loại & Định dạng
- Thể loại * (chọn nhiều)
- Định dạng chiếu (2D, 3D, IMAX, 4DX, ScreenX)

#### Thông tin sản xuất
- Đạo diễn
- Diễn viên
- Nhà sản xuất
- Quốc gia
- Ngôn ngữ
- Phụ đề

#### Hình ảnh & Video
- URL Poster *
- URL Backdrop
- URL Trailer (YouTube Embed)

#### Thông tin IMDB
- IMDB Rating
- IMDB ID

*Trường bắt buộc

### 4. Chỉnh sửa phim
- Hover chuột vào poster phim
- Nhấn nút **Edit** (biểu tượng bút)
- Form sẽ mở ra với dữ liệu hiện tại
- Chỉnh sửa và nhấn **"Cập nhật"**

### 5. Xóa phim
- Hover chuột vào poster phim
- Nhấn nút **Delete** (biểu tượng thùng rác)
- Xác nhận xóa trong dialog

## Cách sử dụng

### Truy cập Dashboard
Truy cập URL: `http://localhost:3000/admin/dashboard`

### Các thao tác nhanh

#### Tìm phim cụ thể
1. Nhập tên phim vào ô tìm kiếm
2. Kết quả hiển thị ngay lập tức

#### Lọc phim đang chiếu
1. Chọn "Đang chiếu" trong dropdown trạng thái
2. Danh sách tự động cập nhật

#### Thêm phim mới
1. Nhấn "Thêm Phim Mới"
2. Điền thông tin cần thiết (có dấu *)
3. Chọn thể loại và định dạng
4. Nhấn "Thêm mới"

#### Chỉnh sửa thông tin phim
1. Hover vào poster phim cần sửa
2. Nhấn biểu tượng bút chì màu xanh lá
3. Cập nhật thông tin
4. Nhấn "Cập nhật"

#### Xóa phim
1. Hover vào poster phim cần xóa
2. Nhấn biểu tượng thùng rác màu đỏ
3. Xác nhận xóa

## API Endpoints sử dụng

### GET /movies
Lấy danh sách phim với query parameters:
- `status`: NOW_SHOWING | COMING_SOON
- `page`: số trang (mặc định: 0)
- `size`: số lượng/trang (mặc định: 12)
- `sortBy`: releaseDate | title | popularity
- `sortDir`: asc | desc

### GET /movies/{movieId}
Lấy chi tiết một phim

### POST /admin/movies
Tạo phim mới (yêu cầu quyền admin)

### PUT /admin/movies/{movieId}
Cập nhật thông tin phim (yêu cầu quyền admin)

### DELETE /admin/movies/{movieId}
Xóa phim (yêu cầu quyền admin)

### GET /genres
Lấy danh sách thể loại phim

## Cấu trúc dữ liệu Movie

```javascript
{
  "movieId": 1,
  "title": "Avatar: The Way of Water",
  "titleEn": "Avatar: The Way of Water",
  "ageRating": "T13",
  "contentWarning": "Phim có một số cảnh bạo lực...",
  "synopsis": "Câu chuyện diễn ra...",
  "synopsisEn": "Set more than a decade...",
  "duration": 192,
  "releaseDate": "2022-12-16",
  "endDate": "2023-03-15",
  "country": "Mỹ",
  "language": "Tiếng Anh",
  "subtitleLanguage": "Tiếng Việt",
  "director": "James Cameron",
  "cast": "Sam Worthington, Zoe Saldana...",
  "producer": "James Cameron, Jon Landau",
  "posterUrl": "https://...",
  "backdropUrl": "https://...",
  "trailerUrl": "https://youtube.com/embed/...",
  "status": "NOW_SHOWING",
  "isFeatured": true,
  "genres": [
    {"id": 1, "name": "Khoa học viễn tưởng"},
    {"id": 2, "name": "Hành động"}
  ],
  "availableFormats": ["2D", "3D", "IMAX"],
  "imdbRating": 7.8,
  "imdbId": "tt1630029"
}
```

## Files đã tạo

1. **src/services/movieService.js** - Service xử lý API calls
2. **src/components/Dashboard.js** - Component chính của dashboard
3. **src/components/Dashboard.css** - Styling cho dashboard
4. **src/components/MovieForm.js** - Form thêm/sửa phim
5. **src/components/MovieForm.css** - Styling cho form

## Files đã cập nhật

1. **src/App.js** - Thêm route `/admin/dashboard`
2. **src/config/api.js** - Thêm endpoints cho admin

## Lưu ý

- Tất cả các thao tác CRUD yêu cầu quyền admin
- Token authentication tự động được thêm vào mọi request
- Form có validation đầy đủ cho các trường bắt buộc
- Giao diện responsive, hoạt động tốt trên mobile
- Toast notifications cho mọi thao tác (thành công/lỗi)

## Responsive Design

Dashboard hoàn toàn responsive:
- **Desktop**: Grid 4-5 cột
- **Tablet**: Grid 3 cột
- **Mobile**: Grid 2 cột, form chuyển sang 1 cột

## Troubleshooting

### Không tải được danh sách phim
- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra token authentication còn hợp lệ
- Xem console log để biết chi tiết lỗi

### Không thể thêm/sửa/xóa phim
- Đảm bảo tài khoản có quyền admin
- Kiểm tra token chưa hết hạn
- Kiểm tra tất cả trường bắt buộc đã điền

### Form không validate
- Các trường có dấu * là bắt buộc
- Thể loại phải chọn ít nhất 1
- URL phải đúng định dạng
- Thời lượng phải > 0

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log của browser (F12)
2. Network tab để xem API responses
3. Backend logs để xem lỗi server-side
