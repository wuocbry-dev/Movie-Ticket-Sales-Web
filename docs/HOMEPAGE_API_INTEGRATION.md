# Hướng Dẫn Kết Nối API Phim Đang Chiếu - Trang Chủ

## Tổng Quan

Đã kết nối API backend vào trang chủ để hiển thị danh sách phim từ database thực tế.

## API Endpoint

### Phim Đang Chiếu
```
GET http://localhost:8080/api/movies?status=NOW_SHOWING&page=0&size=8
```

### Phim Sắp Chiếu
```
GET http://localhost:8080/api/movies?status=COMING_SOON&page=0&size=8
```

## Response Structure

```json
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": {
    "content": [
      {
        "movieId": 1,
        "title": "Tên phim tiếng Việt",
        "titleEn": "English Title",
        "ageRating": "T13",
        "duration": 148,
        "releaseDate": "2025-10-01",
        "status": "NOW_SHOWING",
        "posterUrl": "https://cdn.example.com/posters/movie.jpg",
        "genres": [
          {
            "id": 1,
            "name": "Hành động"
          }
        ],
        "formats": [],
        "imdbRating": 8.5,
        "isFeatured": true
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "size": 8
  }
}
```

## Thay Đổi Trong Code

### 1. HomePage.js - Import Dependencies

```javascript
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
```

### 2. State Management

```javascript
const [nowShowingMovies, setNowShowingMovies] = useState([]);
const [comingSoonMovies, setComingSoonMovies] = useState([]);
const [loading, setLoading] = useState(true);
```

### 3. Fetch Data từ API

```javascript
useEffect(() => {
  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      // Fetch phim đang chiếu
      const nowShowingResponse = await movieService.getMovies({
        status: 'NOW_SHOWING',
        page: 0,
        size: 8
      });
      
      if (nowShowingResponse.success) {
        setNowShowingMovies(nowShowingResponse.data.content);
      }
      
      // Fetch phim sắp chiếu
      const comingSoonResponse = await movieService.getMovies({
        status: 'COMING_SOON',
        page: 0,
        size: 8
      });
      
      if (comingSoonResponse.success) {
        setComingSoonMovies(comingSoonResponse.data.content);
      }
      
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  fetchMovies();
}, []);
```

### 4. Helper Functions

```javascript
// Lấy tên thể loại
const getGenreNames = (genres) => {
  if (!genres || genres.length === 0) return 'Đang cập nhật';
  return genres.map(g => g.name).join(', ');
};

// Format ngày tháng
const formatReleaseDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};
```

### 5. Render với Loading State

```javascript
{loading ? (
  <div className="loading-spinner">Đang tải...</div>
) : (
  <div className="movies-grid">
    {nowShowingMovies.length > 0 ? (
      nowShowingMovies.map((movie) => (
        <div key={movie.movieId} className="movie-card">
          {/* Movie card content */}
        </div>
      ))
    ) : (
      <p className="no-movies">Hiện chưa có phim đang chiếu</p>
    )}
  </div>
)}
```

### 6. Xử Lý Poster Placeholder

```javascript
{movie.posterUrl ? (
  <img src={movie.posterUrl} alt={movie.title} />
) : (
  <div className="poster-placeholder">
    <span>Chưa có poster</span>
  </div>
)}
```

## CSS Mới Thêm

### Loading Spinner
```css
.loading-spinner {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Poster Placeholder
```css
.poster-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1f29 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
```

### No Movies Message
```css
.no-movies {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  font-style: italic;
  grid-column: 1 / -1;
}
```

## Mapping Dữ Liệu

### Từ Mock Data → API Data

| Mock Field | API Field | Ghi Chú |
|------------|-----------|---------|
| `movie.id` | `movie.movieId` | Primary key |
| `movie.title` | `movie.title` | Tên tiếng Việt |
| `movie.image` | `movie.posterUrl` | URL poster (có thể null) |
| `movie.ageRating` | `movie.ageRating` | P, T13, T16, T18, K |
| `movie.genre` | `getGenreNames(movie.genres)` | Array → String |
| `movie.releaseDate` | `formatReleaseDate(movie.releaseDate)` | Format date |

## Tính Năng

### ✅ Đã Hoàn Thành

1. **Fetch API tự động khi load trang**
   - Phim đang chiếu (NOW_SHOWING)
   - Phim sắp chiếu (COMING_SOON)

2. **Loading State**
   - Hiển thị "Đang tải..." khi fetch API
   - Loading spinner với min-height

3. **Error Handling**
   - Try-catch cho API calls
   - Toast notification khi lỗi
   - Console.error để debug

4. **Empty State**
   - Hiển thị thông báo khi không có phim
   - Message thân thiện với người dùng

5. **Poster Placeholder**
   - Hiển thị placeholder khi posterUrl = null
   - Gradient background đẹp mắt

6. **Genre Display**
   - Convert array genres → string
   - Hiển thị "Đang cập nhật" nếu không có

7. **Date Formatting**
   - Format ISO date → Vietnamese format
   - Sử dụng toLocaleDateString('vi-VN')

## Kiểm Tra

### Test Với Backend Running

1. **Start Backend**
   ```bash
   # Terminal Backend
   cd "BE/Movie Ticket Sales Web Project"
   mvnw spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   # Terminal Frontend
   cd FE/my-app
   npm start
   ```

3. **Kiểm Tra**
   - Mở http://localhost:3000
   - Xem phần "PHIM ĐANG CHIẾU"
   - Xem phần "PHIM SẮP CHIẾU"
   - Kiểm tra loading state
   - Kiểm tra poster placeholder

### Test Cases

#### Case 1: API Trả Về Dữ Liệu
```
✅ Hiển thị danh sách phim
✅ Hiển thị poster hoặc placeholder
✅ Hiển thị thể loại phim
✅ Hiển thị age rating
✅ Click vào phim → navigate đúng movieId
```

#### Case 2: API Trả Về Rỗng
```
✅ Hiển thị "Hiện chưa có phim đang chiếu"
✅ Không show lỗi
```

#### Case 3: API Lỗi (Backend không chạy)
```
✅ Toast error: "Không thể tải danh sách phim"
✅ Console.error hiển thị lỗi chi tiết
✅ Loading spinner biến mất
```

## Debug

### Kiểm Tra API Response

```javascript
// Thêm vào useEffect
console.log('Now Showing Response:', nowShowingResponse);
console.log('Now Showing Movies:', nowShowingResponse.data.content);
```

### Kiểm Tra State

```javascript
// Thêm vào component
console.log('Loading:', loading);
console.log('Now Showing Movies State:', nowShowingMovies);
console.log('Coming Soon Movies State:', comingSoonMovies);
```

### Kiểm Tra API Call

```javascript
// Trong DevTools Network tab
// Tìm request: GET /api/movies?status=NOW_SHOWING&page=0&size=8
// Xem Response data
```

## Lỗi Thường Gặp

### 1. API không gọi được
```
Nguyên nhân: Backend chưa chạy hoặc CORS issue
Giải pháp: 
- Start backend: mvnw spring-boot:run
- Kiểm tra CORS config trong SecurityConfig.java
```

### 2. Movies không hiển thị
```
Nguyên nhân: Database không có data hoặc status sai
Giải pháp:
- Kiểm tra database có phim với status NOW_SHOWING
- Chạy sample_data.sql để import data
```

### 3. Poster không hiển thị
```
Nguyên nhân: posterUrl = null hoặc URL không hợp lệ
Giải pháp:
- Placeholder đã được xử lý tự động
- Update posterUrl trong database nếu cần
```

### 4. Loading spinner không biến mất
```
Nguyên nhân: API call bị stuck
Giải pháp:
- Kiểm tra Network tab
- Kiểm tra backend logs
- Thêm timeout cho API call
```

## Tối Ưu Hóa

### Caching (Future)
```javascript
// Sử dụng React Query
import { useQuery } from 'react-query';

const { data, isLoading } = useQuery('nowShowingMovies', 
  () => movieService.getMovies({ status: 'NOW_SHOWING' }),
  { staleTime: 5 * 60 * 1000 } // Cache 5 phút
);
```

### Pagination (Future)
```javascript
// Thêm "Xem thêm" button
const loadMoreMovies = async () => {
  const response = await movieService.getMovies({
    status: 'NOW_SHOWING',
    page: currentPage + 1,
    size: 8
  });
  setNowShowingMovies([...nowShowingMovies, ...response.data.content]);
  setCurrentPage(currentPage + 1);
};
```

### Image Optimization
```javascript
// Lazy loading images
<img 
  src={movie.posterUrl} 
  alt={movie.title}
  loading="lazy"
/>
```

## Files Đã Chỉnh Sửa

1. **src/components/HomePage.js**
   - Thêm state management
   - Thêm useEffect fetch API
   - Thêm helper functions
   - Update render logic

2. **src/components/HomePage.css**
   - Thêm .loading-spinner
   - Thêm .poster-placeholder
   - Thêm .no-movies

3. **src/services/movieService.js**
   - Đã có sẵn, không cần sửa

## Kết Quả

✅ Trang chủ hiển thị phim từ database thực
✅ Loading state mượt mà
✅ Error handling đầy đủ
✅ Poster placeholder cho phim không có ảnh
✅ Empty state khi không có phim
✅ Format date và genres đúng chuẩn
✅ Click vào phim navigate với movieId đúng

---

**Hoàn thành**: Kết nối API phim đang chiếu và sắp chiếu
**Ngày**: 2024
**Version**: 1.0
