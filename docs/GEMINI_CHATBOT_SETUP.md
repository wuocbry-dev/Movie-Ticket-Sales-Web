# Gemini AI Chatbot Setup Guide

## 🤖 Tính năng AI Chatbot với Google Gemini

Chatbot này sử dụng Google Gemini AI để gợi ý phim thông minh dựa trên ngôn ngữ tự nhiên.

### ✨ Tính năng nổi bật:

1. **AI thật sự**: Sử dụng Google Gemini Pro model
2. **Hiểu ngữ cảnh**: Phân tích câu hỏi phức tạp
3. **Gợi ý thông minh**: Đề xuất 3-4 phim phù hợp nhất
4. **Giải thích lý do**: AI giải thích tại sao gợi ý phim đó
5. **Giao diện đẹp**: Thiết kế theo Google Material Design

### 📋 Cách lấy Gemini API Key:

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập Google Account
3. Click "Create API Key"
4. Copy API key

### ⚙️ Cấu hình Backend:

**Bước 1**: Mở file `application.properties`
```properties
# Gemini AI Configuration
gemini.api.key=YOUR_GEMINI_API_KEY_HERE
```

**Bước 2**: Thay `YOUR_GEMINI_API_KEY_HERE` bằng API key của bạn

Ví dụ:
```properties
gemini.api.key=AIzaSyBxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 🚀 Cách sử dụng:

1. **Khởi động backend** (port 8080)
2. **Khởi động frontend** (port 3000)
3. Click nút AI chatbot (góc dưới phải)
4. Chat với AI như bình thường

### 💬 Ví dụ câu hỏi:

**Đơn giản:**
- "Gợi ý phim hành động"
- "Tôi muốn xem phim kinh dị"
- "Phim nào đang hot?"

**Phức tạp:**
- "Tôi thích phim có cốt truyện sâu sắc, kịch tính, không quá bạo lực"
- "Cuối tuần này muốn xem phim cùng bạn gái, gợi ý phim gì lãng mạn nhưng không nhạt"
- "Tôi thích phim Marvel, gợi ý phim tương tự"

### 🎯 AI sẽ:

1. Phân tích câu hỏi của bạn
2. Xem xét tất cả phim đang chiếu
3. Chọn 3-4 phim phù hợp nhất
4. Giải thích tại sao phim đó phù hợp
5. Trả về recommendations với poster, rating, lý do

### 🔧 Troubleshooting:

**Lỗi: "Failed to get response from Gemini"**
- Kiểm tra API key đã đúng chưa
- Kiểm tra internet connection
- Gemini API có thể bị rate limit (free tier: 60 requests/minute)

**Lỗi: "Xin lỗi, tôi đang gặp sự cố kết nối"**
- Backend chưa chạy hoặc sai port
- Kiểm tra console log để debug

### 📊 API Endpoints:

**POST** `/api/chat`
```json
Request:
{
  "message": "Gợi ý phim hành động",
  "userId": 1 (optional)
}

Response:
{
  "message": "Dựa trên yêu cầu của bạn...",
  "recommendations": [
    {
      "movieId": 1,
      "title": "Fast X",
      "posterUrl": "http://...",
      "rating": 8.5,
      "durationMinutes": 120,
      "reason": "Phim hành động tốc độ với nhiều cảnh quay mãn nhãn"
    }
  ]
}
```

### 💡 Tips:

- Gemini free tier: 60 requests/minute
- Mỗi request mất ~2-4 giây
- AI sẽ chỉ gợi ý phim đang chiếu (NOW_SHOWING)
- Có thể hỏi tiếng Việt hoặc tiếng Anh

### 🎨 Customization:

Muốn thay đổi prompt AI, sửa method `buildPrompt()` trong `GeminiChatService.java`

Muốn thay đổi giao diện, sửa `GeminiChatbot.css`

---

## Demo Commands:

```
User: "Phim hành động hay nhất"
AI: "Dựa trên đánh giá cao và thể loại bạn yêu thích, tôi gợi ý..."
[3 phim hành động với lý do cụ thể]

User: "Tôi buồn, gợi ý phim vui"
AI: "Để nâng cao tinh thần, tôi gợi ý những bộ phim hài..."
[3 phim hài với lý do]
```

Enjoy! 🎬🤖
