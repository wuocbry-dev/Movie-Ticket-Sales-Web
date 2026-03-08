// ========================================
// MẪU DỮ LIỆU VỚI ẢNH THẬT
// Copy và thay thế vào HomePage.js
// ========================================

// 1. BANNER SLIDES
// Thay thế từ dòng ~7 trong HomePage.js
const bannerSlides = [
  {
    id: 1,
    image: '/images/banners/banner1.jpg',  // ← Đặt ảnh vào public/images/banners/
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  },
  {
    id: 2,
    image: '/images/banners/banner2.jpg',
    title: 'MẬT MÃ ĐỎ',
    date: '31.03.2025'
  },
  {
    id: 3,
    image: '/images/banners/banner3.jpg',
    title: 'ĐỐC QUYỀN VĂN MINH',
    date: '07.04.2025'
  }
];

// 2. PHIM ĐANG CHIẾU
// Thay thế từ dòng ~22 trong HomePage.js
const nowShowingMovies = [
  {
    id: 1,
    title: 'ĐỐC QUYỀN VĂN MINH',
    image: '/images/movies/doc-quyen-van-minh.jpg',  // ← Đặt ảnh vào public/images/movies/
    rating: 8.5,
    genre: 'Hành động, Phiêu lưu'
  },
  {
    id: 2,
    title: 'CHỊ ĐẠI PHONG BA',
    image: '/images/movies/chi-dai-phong-ba.jpg',
    rating: 9.0,
    genre: 'Tâm lý, Gia đình'
  },
  {
    id: 3,
    title: 'MẬT MÃ ĐỎ: SỰ KIỆN TRỌNG ĐẠI',
    image: '/images/movies/mat-ma-do.jpg',
    rating: 8.8,
    genre: 'Hành động, Trinh thám'
  }
];

// 3. PHIM SẮP CHIẾU
// Thay thế từ dòng ~38 trong HomePage.js
const comingSoonMovies = [
  {
    id: 4,
    title: 'PHIM SẮP CHIẾU 1',
    image: '/images/movies/coming-soon-1.jpg',
    releaseDate: '24.03.2025'
  },
  {
    id: 5,
    title: 'PHIM SẮP CHIẾU 2',
    image: '/images/movies/coming-soon-2.jpg',
    releaseDate: '31.03.2025'
  },
  {
    id: 6,
    title: 'PHIM SẮP CHIẾU 3',
    image: '/images/movies/coming-soon-3.jpg',
    releaseDate: '07.04.2025'
  }
];

// 4. SỰ KIỆN
// Thay thế từ dòng ~54 trong HomePage.js
const events = [
  {
    id: 1,
    title: 'KHUYẾN MÃI ĐẶC BIỆT',
    image: '/images/events/khuyen-mai.jpg',  // ← Đặt ảnh vào public/images/events/
    description: 'Giảm giá 50% vào thứ 3 hàng tuần'
  },
  {
    id: 2,
    title: 'MEMBERSHIP CARD',
    image: '/images/events/membership.jpg',
    description: 'Tích điểm đổi quà hấp dẫn'
  },
  {
    id: 3,
    title: 'SỰ KIỆN ĐẶC BIỆT',
    image: '/images/events/su-kien.jpg',
    description: 'Gặp gỡ diễn viên nổi tiếng'
  }
];

// ========================================
// HOẶC SỬ DỤNG URL TỪ BACKEND API
// ========================================

// Ví dụ: URL từ server
const bannerSlides = [
  {
    id: 1,
    image: 'http://localhost:8080/uploads/banners/banner1.jpg',
    title: 'CHỊ ĐẠI PHONG BA',
    date: '24.03.2025'
  }
];

// Ví dụ: URL từ Cloudinary hoặc AWS S3
const nowShowingMovies = [
  {
    id: 1,
    title: 'ĐỐC QUYỀN VĂN MINH',
    image: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/movies/phim1.jpg',
    rating: 8.5,
    genre: 'Hành động, Phiêu lưu'
  }
];
