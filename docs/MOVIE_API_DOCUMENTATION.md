# Movie & Cinema API Documentation

## 📋 Tổng Quan

API này cung cấp các endpoint để quản lý thông tin phim và rạp chiếu, hỗ trợ cho:
- **Admin**: Quản lý toàn bộ hệ thống phim
- **Staff**: Bán hàng và hỗ trợ khách hàng  
- **Customer**: Xem thông tin phim và đặt vé

## 🎬 Movie APIs

### 2.1. Get Movies List
```http
GET /api/movies
```

#### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | `"NOW_SHOWING"` \| `"COMING_SOON"` \| `"END_SHOWING"` |
| `page` | number | 0 | Số trang (bắt đầu từ 0) |
| `size` | number | 12 | Số phim mỗi trang |
| `sortBy` | string | `"releaseDate"` | `"releaseDate"` \| `"title"` \| `"popularity"` |
| `sortDir` | string | `"desc"` | `"asc"` \| `"desc"` |

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": {
    "content": [
      {
        "movieId": 1,
        "title": "Avatar: The Way of Water",
        "titleEn": "Avatar: The Way of Water",
        "ageRating": "T13",
        "duration": 192,
        "releaseDate": "2022-12-16",
        "status": "NOW_SHOWING",
        "posterUrl": "https://cdn.example.com/posters/avatar2.jpg",
        "genres": [
          {"id": 1, "name": "Khoa học viễn tưởng"},
          {"id": 2, "name": "Hành động"}
        ],
        "formats": ["2D", "3D", "IMAX"],
        "imdbRating": 7.8,
        "isFeatured": true
      }
    ],
    "totalElements": 45,
    "totalPages": 4,
    "currentPage": 0,
    "size": 12
  }
}
```

#### Example Requests:
```bash
# Lấy tất cả phim đang chiếu
GET /api/movies?status=NOW_SHOWING

# Lấy phim sắp chiếu, sắp xếp theo tên
GET /api/movies?status=COMING_SOON&sortBy=title&sortDir=asc

# Lấy trang 2, mỗi trang 20 phim
GET /api/movies?page=1&size=20

# Lấy phim phổ biến
GET /api/movies?sortBy=popularity&sortDir=desc
```

---

### 2.2. Get Movie Details
```http
GET /api/movies/{movieId}
```

#### Path Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `movieId` | number | ✅ | ID của phim |

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Movie details retrieved successfully", 
  "data": {
    "movieId": 1,
    "title": "Avatar: The Way of Water",
    "titleEn": "Avatar: The Way of Water",
    "ageRating": "T13",
    "contentWarning": "Phim có một số cảnh bạo lực, khán giả cân nhắc trước khi xem",
    "synopsis": "Câu chuyện diễn ra hơn một thập kỷ sau những sự kiện của phần phim đầu tiên...",
    "synopsisEn": "Set more than a decade after the events of the first film...",
    "duration": 192,
    "releaseDate": "2022-12-16",
    "endDate": "2023-03-15",
    "country": "Mỹ",
    "language": "Tiếng Anh",
    "subtitleLanguage": "Tiếng Việt",
    "director": "James Cameron",
    "cast": "Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang",
    "producer": "James Cameron, Jon Landau",
    "posterUrl": "https://cdn.example.com/posters/avatar2.jpg",
    "backdropUrl": "https://cdn.example.com/backdrops/avatar2.jpg",
    "trailerUrl": "https://www.youtube.com/embed/d9MyW72ELq0",
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
}
```

#### Error Response (404 Not Found):
```json
{
  "success": false,
  "message": "Failed to retrieve movie details: Movie not found with ID: 999"
}
```

#### Example Requests:
```bash
# Lấy chi tiết phim Avatar
GET /api/movies/1

# Lấy chi tiết phim Black Panther
GET /api/movies/2
```

---

## 🎭 Age Rating System

| Rating | Mô Tả |
|--------|--------|
| `P` | Phim dành cho mọi lứa tuổi |
| `K` | Phim dành cho trẻ em |
| `T13` | Phim dành cho khán giả từ 13 tuổi trở lên |
| `T16` | Phim dành cho khán giả từ 16 tuổi trở lên |
| `T18` | Phim dành cho khán giả từ 18 tuổi trở lên |

## 🎥 Movie Status

| Status | Mô Tả |
|--------|--------|
| `COMING_SOON` | Phim sắp chiếu |
| `NOW_SHOWING` | Phim đang chiếu |
| `END_SHOWING` | Phim ngừng chiếu |

## 🎬 Available Formats

| Format | Mô Tả |
|--------|--------|
| `2D` | Phim 2D thông thường |
| `3D` | Phim 3D |
| `IMAX` | Định dạng IMAX |
| `4DX` | Định dạng 4DX |
| `SCREENX` | Định dạng ScreenX |

---

## 🔐 Phân Quyền Truy Cập

### 🔓 Public Access (Không cần authentication)
- `GET /api/movies` - Xem danh sách phim
- `GET /api/movies/{movieId}` - Xem chi tiết phim

### 👤 Customer Role
- Xem tất cả thông tin phim
- Đặt vé (sẽ implement trong tương lai)

### 👷 Staff Role  
- Xem tất cả thông tin phim
- Hỗ trợ đặt vé cho khách hàng

### 👑 Admin Role
- Quản lý phim (CRUD operations - sẽ implement)
- Quản lý rạp và suất chiếu
- Xem báo cáo và thống kê

---

## 📊 Error Handling

### Success Response Structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response Structure:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes:
- `200` - OK (Success)
- `400` - Bad Request (Invalid parameters)
- `404` - Not Found (Resource not found)  
- `500` - Internal Server Error

---

## 📝 Sample Usage

### Frontend Integration Example:

```javascript
// React component example
const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies?status=NOW_SHOWING&size=10');
        const result = await response.json();
        
        if (result.success) {
          setMovies(result.data.content);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div>
      {movies.map(movie => (
        <MovieCard key={movie.movieId} movie={movie} />
      ))}
    </div>
  );
};
```

### Curl Examples:

```bash
# Lấy danh sách phim đang chiếu
curl -X GET "http://localhost:8080/api/movies?status=NOW_SHOWING" \
  -H "Content-Type: application/json"

# Lấy chi tiết phim
curl -X GET "http://localhost:8080/api/movies/1" \
  -H "Content-Type: application/json"

# Lấy phim với pagination
curl -X GET "http://localhost:8080/api/movies?page=0&size=5&sortBy=title&sortDir=asc" \
  -H "Content-Type: application/json"
```

---

## 🔄 Testing

### Setup Test Data:
1. Chạy script `sample_movie_data.sql` để thêm dữ liệu mẫu
2. Restart ứng dụng Spring Boot
3. Test các endpoints với Postman hoặc curl

### Postman Collection:
Import file `Movie_API_Collection.json` vào Postman để test nhanh các endpoints.

---

## 🚀 Next Steps

### Planned Features:
1. **Movie Management API** (Admin only)
   - `POST /api/admin/movies` - Thêm phim mới
   - `PUT /api/admin/movies/{id}` - Cập nhật phim
   - `DELETE /api/admin/movies/{id}` - Xóa phim

2. **Cinema & Showtime APIs**
   - `GET /api/cinemas` - Danh sách rạp
   - `GET /api/movies/{id}/showtimes` - Suất chiếu theo phim
   - `GET /api/cinemas/{id}/showtimes` - Suất chiếu theo rạp

3. **Search & Filter Enhancement**
   - Tìm kiếm theo tên phim
   - Lọc theo thể loại
   - Lọc theo rating

4. **Booking System**
   - `POST /api/bookings` - Đặt vé
   - `GET /api/bookings/{id}` - Chi tiết đặt vé
   - `PUT /api/bookings/{id}/cancel` - Hủy vé