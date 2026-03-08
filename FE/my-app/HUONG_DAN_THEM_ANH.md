# HƯỚNG DẪN THÊM ẢNH VÀO PROJECT

## 📁 CẤU TRÚC THỨ MỤC ĐÃ TẠO

```
public/
  images/
    banners/     - Đặt ảnh banner slider ở đây
    movies/      - Đặt poster phim ở đây
    events/      - Đặt ảnh sự kiện ở đây
```

---

## 🎯 CÁCH 1: SỬ DỤNG ẢNH TỪ THỨ MỤC PUBLIC (KHUYẾN NGHỊ)

### Bước 1: Copy ảnh vào thư mục
Copy các file ảnh của bạn vào các thư mục đã tạo:
- Banner: `public/images/banners/`
- Poster phim: `public/images/movies/`
- Sự kiện: `public/images/events/`

**Ví dụ:**
```
public/images/banners/banner1.jpg
public/images/banners/banner2.jpg
public/images/movies/phim1.jpg
public/images/movies/phim2.jpg
public/images/events/event1.jpg
```

### Bước 2: Sửa code trong HomePage.js

Mở file `src/components/HomePage.js` và thay đổi:

```javascript
// TRƯỚC (placeholder):
const bannerSlides = [
  {
    id: 1,
    image: 'https://via.placeholder.com/1200x500/1a1a2e/ffffff?text=CHỊ+ĐẠI+PHONG+BA',
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  }
];

// SAU (ảnh thật):
const bannerSlides = [
  {
    id: 1,
    image: '/images/banners/banner1.jpg',  // ← Đường dẫn tới ảnh
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  },
  {
    id: 2,
    image: '/images/banners/banner2.jpg',
    title: 'PHIM HOT 2',
    date: '31.03.2025'
  }
];
```

**Tương tự cho phim:**
```javascript
const nowShowingMovies = [
  {
    id: 1,
    title: 'ĐỐC QUYỀN VĂN MINH',
    image: '/images/movies/phim1.jpg',  // ← Thay đổi ở đây
    rating: 8.5,
    genre: 'Hành động, Phiêu lưu'
  }
];
```

**Và sự kiện:**
```javascript
const events = [
  {
    id: 1,
    title: 'KHUYẾN MÃI ĐẶC BIỆT',
    image: '/images/events/event1.jpg',  // ← Thay đổi ở đây
    description: 'Giảm giá 50% vào thứ 3 hàng tuần'
  }
];
```

---

## 🌐 CÁCH 2: SỬ DỤNG URL TỪ INTERNET

Nếu ảnh đã được upload lên server/cloud, dùng URL trực tiếp:

```javascript
const bannerSlides = [
  {
    id: 1,
    image: 'https://your-domain.com/images/banner1.jpg',
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  }
];
```

---

## 📦 CÁCH 3: SỬ DỤNG IMPORT (Cho assets trong src/)

### Bước 1: Tạo thư mục assets
```
src/
  assets/
    images/
      banners/
      movies/
      events/
```

### Bước 2: Import ảnh
```javascript
import banner1 from '../assets/images/banners/banner1.jpg';
import phim1 from '../assets/images/movies/phim1.jpg';

const bannerSlides = [
  {
    id: 1,
    image: banner1,  // ← Sử dụng biến đã import
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  }
];
```

---

## 🔌 CÁCH 4: LẤY ẢNH TỪ API BACKEND

Khi có backend API:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [bannerSlides, setBannerSlides] = useState([]);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Lấy banners từ API
    axios.get('http://localhost:8080/api/banners')
      .then(response => setBannerSlides(response.data))
      .catch(error => console.error(error));

    // Lấy phim từ API
    axios.get('http://localhost:8080/api/movies')
      .then(response => setMovies(response.data))
      .catch(error => console.error(error));
  }, []);

  // Render...
};
```

Response từ API nên có dạng:
```json
[
  {
    "id": 1,
    "title": "CHỊ ĐẠI PHONG BA",
    "image": "http://localhost:8080/uploads/banner1.jpg",
    "date": "24.03.2025"
  }
]
```

---

## ✅ KHUYẾN NGHỊ

### Cho Development (đang phát triển):
- **Cách 1** (public folder) - Đơn giản, nhanh chóng

### Cho Production (lên server thật):
- **Cách 4** (API Backend) - Chuyên nghiệp, dễ quản lý
- Ảnh nên lưu trên server backend hoặc cloud storage (AWS S3, Cloudinary, etc.)

---

## 📋 KÍCH THƯỚC ẢNH KHUYẾN NGHỊ

- **Banner**: 1920x600px (hoặc 1200x500px)
- **Poster phim**: 300x450px (tỷ lệ 2:3)
- **Sự kiện**: 400x200px (tỷ lệ 2:1)

---

## 🎨 ĐỊNH DẠNG FILE

- `.jpg` / `.jpeg` - Tốt cho ảnh có nhiều màu sắc
- `.png` - Tốt cho ảnh có nền trong suốt
- `.webp` - Nhẹ hơn, hiện đại (khuyến nghị)

---

## ⚠️ LƯU Ý

1. **Tên file không dấu, không khoảng trắng**
   - ✅ Đúng: `chi-dai-phong-ba.jpg`, `banner1.jpg`
   - ❌ Sai: `chị đại phong bà.jpg`, `banner 1.jpg`

2. **Kích thước file**
   - Nén ảnh trước khi dùng (< 500KB cho poster, < 1MB cho banner)
   - Dùng công cụ: TinyPNG, Squoosh.app

3. **Đường dẫn trong public**
   - Luôn bắt đầu bằng `/` (ví dụ: `/images/movies/phim1.jpg`)
   - KHÔNG cần `public` trong đường dẫn

---

## 🚀 QUICK START

1. Copy ảnh vào `public/images/movies/phim1.jpg`
2. Mở `src/components/HomePage.js`
3. Tìm dòng `image: 'https://via.placeholder.com...'`
4. Thay bằng `image: '/images/movies/phim1.jpg'`
5. Lưu file và reload trang

**Xong! Ảnh sẽ hiển thị!** 🎉
