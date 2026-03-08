# HƯỚNG DẪN ĐIỀU HƯỚNG (ROUTING)

## 🎯 Các trang đã được cấu hình:

### 1. **Trang Chủ (Homepage)**
- **URL**: `http://localhost:3000/`
- **Component**: `HomePage.js`
- **Nội dung**: Banner slider, phim đang chiếu, phim sắp chiếu, sự kiện

### 2. **Trang Đăng Nhập (Login)**
- **URL**: `http://localhost:3000/login`
- **Component**: `LoginForm.js`
- **Nội dung**: Form đăng nhập, đăng ký

---

## 🔗 Cách chuyển trang:

### Từ Header:
- **Logo** (icon camera) → Click để về Trang chủ
- **"Đăng nhập"** → Click để đến trang Login
- **Icon camera bên phải** → Click để về Trang chủ
- **Menu navigation** (Chọn rạp, Lịch chiếu...) → Về Trang chủ

### Trong Code:
```javascript
import { Link } from 'react-router-dom';

// Sử dụng Link component
<Link to="/">Trang chủ</Link>
<Link to="/login">Đăng nhập</Link>

// Hoặc sử dụng useNavigate hook
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToHome = () => {
    navigate('/');
  };
  
  const goToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div>
      <button onClick={goToHome}>Về trang chủ</button>
      <button onClick={goToLogin}>Đăng nhập</button>
    </div>
  );
}
```

---

## 📋 Thêm trang mới:

### Bước 1: Tạo component mới
```javascript
// src/components/MovieDetail.js
import React from 'react';
import './MovieDetail.css';

const MovieDetail = () => {
  return (
    <div className="movie-detail">
      <h1>Chi tiết phim</h1>
    </div>
  );
};

export default MovieDetail;
```

### Bước 2: Thêm route vào App.js
```javascript
import MovieDetail from './components/MovieDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/movie/:id" element={<MovieDetail />} />  {/* ← Thêm route mới */}
        </Routes>
      </div>
    </Router>
  );
}
```

### Bước 3: Tạo link đến trang mới
```javascript
// Trong HomePage.js hoặc component khác
<Link to="/movie/123">Xem chi tiết phim</Link>

// Hoặc với navigate
const navigate = useNavigate();
navigate('/movie/123');
```

---

## 🎨 Các route có thể thêm:

```javascript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginForm />} />
  <Route path="/register" element={<RegisterForm />} />
  <Route path="/movies" element={<MovieList />} />
  <Route path="/movie/:id" element={<MovieDetail />} />
  <Route path="/booking/:movieId" element={<BookingPage />} />
  <Route path="/my-tickets" element={<MyTickets />} />
  <Route path="/profile" element={<UserProfile />} />
  <Route path="/cinemas" element={<CinemaList />} />
  <Route path="/events" element={<EventList />} />
  <Route path="/promotions" element={<Promotions />} />
  <Route path="*" element={<NotFound />} />  {/* 404 page */}
</Routes>
```

---

## 🔒 Protected Routes (Yêu cầu đăng nhập):

```javascript
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Component bảo vệ route
const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('authToken');
  
  if (!token) {
    // Chưa đăng nhập → Chuyển về login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Sử dụng
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      
      {/* Routes yêu cầu đăng nhập */}
      <Route 
        path="/my-tickets" 
        element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

---

## 📍 Lấy params từ URL:

```javascript
import { useParams } from 'react-router-dom';

function MovieDetail() {
  const { id } = useParams();  // Lấy id từ URL /movie/:id
  
  useEffect(() => {
    // Gọi API lấy thông tin phim theo id
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then(res => res.json())
      .then(data => console.log(data));
  }, [id]);
  
  return <div>Movie ID: {id}</div>;
}
```

---

## 🔍 Lấy query parameters:

```javascript
import { useSearchParams } from 'react-router-dom';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');  // Lấy từ URL ?q=keyword
  const page = searchParams.get('page') || 1;
  
  return (
    <div>
      <p>Tìm kiếm: {query}</p>
      <p>Trang: {page}</p>
    </div>
  );
}

// URL: /search?q=action&page=2
```

---

## ↩️ Điều hướng sau khi đăng nhập:

```javascript
// Trong LoginForm.js
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  
  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      
      // Lưu token
      Cookies.set('authToken', response.data.token);
      
      toast.success('Đăng nhập thành công!');
      
      // Chuyển về trang chủ
      navigate('/');
      
    } catch (error) {
      toast.error('Đăng nhập thất bại');
    }
  };
};
```

---

## 🎯 Best Practices:

1. ✅ **Dùng `<Link>` thay vì `<a>`** để tránh reload trang
2. ✅ **Dùng `navigate()` thay vì `window.location`** để điều hướng
3. ✅ **Tổ chức routes** theo thứ tự: public → protected → 404
4. ✅ **Lazy loading** cho routes ít dùng:
   ```javascript
   const MovieDetail = lazy(() => import('./components/MovieDetail'));
   ```
5. ✅ **Scroll to top** khi chuyển trang:
   ```javascript
   useEffect(() => {
     window.scrollTo(0, 0);
   }, [location]);
   ```

---

## 🚀 Quick Reference:

```javascript
// Import
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';

// Sử dụng
<Link to="/path">Text</Link>                    // Link component
const navigate = useNavigate();                 // Hook điều hướng
navigate('/path');                              // Chuyển trang
const { id } = useParams();                     // Lấy URL params
const location = useLocation();                 // Thông tin location hiện tại
```

---

## ✅ Hiện tại đã hoạt động:

- ✅ Trang chủ: `/`
- ✅ Đăng nhập: `/login`
- ✅ Logo → Về trang chủ
- ✅ "Đăng nhập" → Trang login
- ✅ Navigation menu → Về trang chủ

**Test ngay**: Click vào các link trong Header để chuyển trang! 🎬
