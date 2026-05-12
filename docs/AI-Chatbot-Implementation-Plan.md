# Kế hoạch tích hợp AI Chatbot Multi-Node

## Tổng quan

Tích hợp module AI Chatbot với kiến trúc **6 node** (Assistant → Filter → Intent → Permission → Executor → Checker) vào hệ thống bán vé rạp phim hiện tại. Chatbot sử dụng **Gemini API** qua backend, phân quyền theo JWT, không lộ API key ra frontend.

### Hiện trạng
- Backend đã có: `ChatController.java`, `GeminiChatService.java`, `ChatRequest.java`, `ChatResponse.java`
- Frontend đã có: `GeminiChatbot.js`, `GeminiChatbot.css`
- Chatbot hiện tại **chỉ gợi ý phim**, không có phân quyền, không chống prompt injection, không có kiến trúc node

### Mục tiêu
- Nâng cấp thành kiến trúc multi-node với separation of concerns
- Phân quyền chatbot theo Guest/User/Staff/Admin
- Chống prompt injection và bảo vệ thông tin nhạy cảm
- Mở rộng action: tìm phim, đặt vé, xem vé, hủy vé, xem suất chiếu, khuyến mãi, thống kê...

---

## 1. Cấu trúc thư mục mới đề xuất

### Backend - Thêm package `chatbot`

```
BE/Movie Ticket Sales Web Project/src/main/java/aws/movie_ticket_sales_web_project/
├── api/
│   ├── ChatController.java              ← [SỬA] Đổi endpoint, thêm JWT auth
│   └── ... (giữ nguyên)
├── chatbot/                              ← [MỚI] Package chatbot
│   ├── node/
│   │   ├── AssistantNode.java            ← Giao tiếp user, điều phối hội thoại
│   │   ├── FilterNode.java              ← Chặn prompt injection
│   │   ├── IntentClassifierNode.java    ← Phân loại ý định
│   │   ├── PermissionNode.java          ← Kiểm tra quyền theo role
│   │   ├── ExecutorNode.java            ← Gọi service thật
│   │   └── CheckerNode.java            ← Kiểm tra response trước khi trả
│   ├── dto/
│   │   ├── ChatbotRequest.java          ← Request mới (thay ChatRequest cũ)
│   │   ├── ChatbotResponse.java         ← Response mới (mở rộng ChatResponse)
│   │   ├── ChatContext.java             ← Context truyền giữa các node
│   │   └── ChatAction.java             ← Action result từ Executor
│   ├── enums/
│   │   ├── ChatIntent.java              ← Enum các intent
│   │   └── ChatRole.java               ← Enum role cho chatbot
│   ├── config/
│   │   └── ChatbotPromptConfig.java     ← System prompt templates
│   └── ChatbotOrchestrator.java         ← Điều phối pipeline 6 node
├── config/
│   └── SecurityConfig.java              ← [SỬA] Cập nhật endpoint chatbot
├── dto/
│   ├── ChatRequest.java                 ← [GIỮ] backward compatible
│   └── ChatResponse.java               ← [GIỮ] backward compatible
├── service/
│   └── GeminiChatService.java           ← [SỬA] Refactor thành AI client thuần
└── ... (các package khác giữ nguyên)
```

### Frontend - Tách thư mục Chatbot

```
FE/my-app/src/
├── components/
│   └── UserInterface/
│       ├── Chatbot/                      ← [MỚI] Thư mục chatbot
│       │   ├── ChatbotWidget.js          ← Component chính (refactor từ GeminiChatbot.js)
│       │   ├── ChatbotWidget.css         ← Styles (refactor từ GeminiChatbot.css)
│       │   ├── ChatMessage.js            ← Component render từng message
│       │   ├── ChatActionCard.js         ← Component render action results
│       │   └── QuickActions.js           ← Gợi ý nhanh theo role
│       ├── GeminiChatbot.js             ← [GIỮ] Wrapper backward compatible
│       └── GeminiChatbot.css            ← [GIỮ]
├── services/
│   ├── chatbotService.js                ← [MỚI] API calls cho chatbot
│   └── api.js                           ← [GIỮ nguyên]
└── ...
```

---

## 2. Các file Backend cần thêm

### 2.1. `ChatbotOrchestrator.java` — Điều phối pipeline

```
Vị trí: chatbot/ChatbotOrchestrator.java
Vai trò: Nhận request → chạy qua 6 node theo thứ tự → trả response
```

**Flow xử lý:**
```
Request → FilterNode.filter() 
       → IntentClassifierNode.classify()
       → PermissionNode.check()
       → AssistantNode.process()
       → ExecutorNode.execute()
       → CheckerNode.verify()
       → Response
```

### 2.2. Các Node files

| File | Vai trò |
|------|---------|
| `FilterNode.java` | Kiểm tra message: chặn SQL injection keywords, chặn hỏi về API key/database/system prompt, chặn câu hỏi ngoài phạm vi rạp phim. Dùng regex + blacklist keywords |
| `IntentClassifierNode.java` | Gọi Gemini với prompt ngắn để phân loại intent thành enum (SEARCH_MOVIE, VIEW_SHOWTIME, CHECK_SEAT, BOOK_TICKET, VIEW_MY_TICKETS, ASK_PROMOTION, ASK_PRICE, CANCEL_TICKET, ASK_POLICY, VIEW_STATS, GENERAL_CHAT) |
| `PermissionNode.java` | Map intent → required role. So sánh với role hiện tại từ JWT. Trả về ALLOWED/DENIED |
| `AssistantNode.java` | Xây dựng prompt cho Gemini với context phù hợp. Không chứa SQL/repository logic. Chỉ biết "action names" |
| `ExecutorNode.java` | Nhận action từ Assistant → gọi service thật (MovieService, ShowtimeService, BookingService...). Trả về data đã format |
| `CheckerNode.java` | Kiểm tra response cuối: loại bỏ thông tin nhạy cảm (email, password, token, SQL), đảm bảo không trả dữ liệu vượt quyền |

### 2.3. DTO files

**`ChatbotRequest.java`:**
```java
public class ChatbotRequest {
    private String message;           // Tin nhắn user
    private String conversationId;    // ID cuộc hội thoại (optional)
    // userId và role sẽ lấy từ JWT, KHÔNG lấy từ request body
}
```

**`ChatbotResponse.java`:**
```java
public class ChatbotResponse {
    private String message;                          // Tin nhắn trả lời
    private String conversationId;                   // ID cuộc hội thoại
    private String intent;                           // Intent đã phân loại
    private List<MovieRecommendation> recommendations; // Gợi ý phim (nếu có)
    private Object actionData;                       // Dữ liệu action (vé, suất chiếu...)
    private String actionType;                       // Loại action đã thực hiện
    private List<String> suggestedActions;            // Gợi ý hành động tiếp theo
}
```

**`ChatContext.java`:**
```java
public class ChatContext {
    private String userMessage;        // Message gốc
    private Integer userId;            // Từ JWT (null = Guest)
    private String userRole;           // GUEST/USER/STAFF/ADMIN
    private ChatIntent intent;         // Intent đã phân loại
    private boolean permissionGranted; // Đã check quyền
    private String assistantPrompt;    // Prompt cho Gemini
    private Object executorResult;     // Kết quả từ Executor
    private String finalResponse;      // Response sau Checker
    private String conversationId;
}
```

**`ChatIntent.java` (enum):**
```java
public enum ChatIntent {
    SEARCH_MOVIE,        // Tìm phim
    VIEW_SHOWTIME,       // Xem suất chiếu
    CHECK_SEAT,          // Kiểm tra ghế trống
    BOOK_TICKET,         // Đặt vé
    VIEW_MY_TICKETS,     // Xem vé của tôi
    CANCEL_TICKET,       // Hủy vé
    ASK_PROMOTION,       // Hỏi khuyến mãi
    ASK_PRICE,           // Hỏi giá vé
    ASK_POLICY,          // Hỏi chính sách
    VIEW_STATS,          // Xem thống kê (Admin)
    MANAGE_MOVIE,        // Quản lý phim (Admin)
    STAFF_CHECK_IN,      // Check-in vé (Staff)
    GENERAL_CHAT,        // Chat chung
    BLOCKED              // Bị chặn bởi Filter
}
```

### 2.4. Config files

**`ChatbotPromptConfig.java`:**
```
Vai trò: Chứa các system prompt template cho từng node
- FILTER_PROMPT: prompt để AI đánh giá message có an toàn không
- INTENT_PROMPT: prompt để AI phân loại intent
- ASSISTANT_PROMPT_TEMPLATE: prompt chính cho Assistant Node
- CHECKER_PROMPT: prompt để AI kiểm tra response
```

### 2.5. Sửa files hiện có

#### [SỬA] `ChatController.java`
```diff
- @RequestMapping("/api/chat")
- @CrossOrigin(origins = "*")
+ @RequestMapping("/api/chatbot")

- public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request)
+ // Endpoint mới có JWT authentication
+ @PostMapping("/message")
+ public ResponseEntity<ChatbotResponse> sendMessage(
+     @RequestBody ChatbotRequest request,
+     @AuthenticationPrincipal CustomUserDetails userDetails  // Lấy user từ JWT
+ )
+
+ // Giữ endpoint cũ /api/chat cho backward compatible
```

#### [SỬA] `SecurityConfig.java`
```diff
  // Chatbot endpoints
- .requestMatchers("/api/chat/**").permitAll()
+ .requestMatchers("/api/chat/**").permitAll()           // Backward compatible
+ .requestMatchers("/api/chatbot/**").permitAll()        // Mới - cho phép Guest
  // Note: Chatbot tự xử lý phân quyền nội bộ qua PermissionNode
  // permitAll() để Guest cũng dùng được, nhưng có JWT thì sẽ biết role
```

#### [SỬA] `GeminiChatService.java`
```
Refactor thành AI client thuần:
- Giữ nguyên callGeminiAPI() method
- Thêm method mới: classifyIntent(), generateResponse(), checkSafety()
- Tách business logic ra khỏi service này → chuyển vào các Node
```

---

## 3. Các file Frontend cần thêm/sửa

### 3.1. [MỚI] `chatbotService.js`
```javascript
// Gọi API chatbot mới qua axios instance có JWT tự động
import api from './api';  // Dùng api instance đã có interceptor JWT

export const sendChatMessage = (message, conversationId) => {
    return api.post('/chatbot/message', { message, conversationId });
};
```

### 3.2. [MỚI] `ChatbotWidget.js`
Refactor từ `GeminiChatbot.js`:
- Dùng `chatbotService.js` thay vì gọi axios trực tiếp
- Hiển thị `actionData` (vé, suất chiếu, ghế...) bằng `ChatActionCard`
- Quick actions thay đổi theo role (lấy từ localStorage user info)
- **Không gửi userId trong body** → backend tự lấy từ JWT

### 3.3. [MỚI] `ChatMessage.js`
- Component render từng tin nhắn
- Hỗ trợ render markdown, emoji, movie card, ticket card

### 3.4. [MỚI] `ChatActionCard.js`
- Render kết quả action: danh sách phim, suất chiếu, vé đã đặt, ghế trống...
- Có nút bấm tương tác (xem chi tiết phim, chọn suất chiếu, đặt vé)

### 3.5. [MỚI] `QuickActions.js`
- Gợi ý nhanh thay đổi theo role:
  - **Guest**: "Phim đang chiếu?", "Suất chiếu hôm nay?"
  - **User**: "Vé của tôi", "Đặt vé", "Hủy vé"
  - **Staff**: "Check-in vé", "Tra cứu booking"
  - **Admin**: "Thống kê doanh thu", "Quản lý phim"

### 3.6. [SỬA] `GeminiChatbot.js`
- Chuyển thành wrapper: `import ChatbotWidget → render ChatbotWidget`
- Giữ backward compatible cho các trang đang dùng

---

## 4. Flow xử lý Chatbot

```
┌──────────┐    ┌──────────────┐    ┌─────────────────────┐
│  User    │───▶│  React FE    │───▶│  Spring Boot API    │
│ (Browser)│    │ ChatbotWidget│    │ POST /api/chatbot   │
└──────────┘    └──────────────┘    │      /message       │
                   │ JWT Token       └────────┬────────────┘
                   │ + Message                │
                   ▼                          ▼
                                    ┌─────────────────────┐
                                    │ ChatController      │
                                    │ - Trích xuất JWT    │
                                    │ - Xác định userId   │
                                    │ - Xác định role     │
                                    └────────┬────────────┘
                                             │
                                             ▼
                                    ┌─────────────────────┐
                                    │ ChatbotOrchestrator │
                                    │ (Pipeline Manager)  │
                                    └────────┬────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
         ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    ①    │   FilterNode     │──▶│IntentClassifier  │──▶│ PermissionNode   │
         │                  │    │     Node          │    │                  │
         │ - Chặn injection │    │ - Gọi Gemini     │    │ - Check role     │
         │ - Chặn leak      │    │ - Trả ChatIntent │    │ - ALLOWED/DENIED │
         │ - Chặn off-topic │    │                  │    │                  │
         └──────────────────┘    └──────────────────┘    └────────┬─────────┘
                                                                  │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
         ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    ②    │ AssistantNode    │──▶│  ExecutorNode     │──▶│  CheckerNode     │
         │                  │    │                  │    │                  │
         │ - Xây prompt     │    │ - Gọi Service    │    │ - Loại bỏ nhạy  │
         │ - Gọi Gemini     │    │ - MovieService   │    │   cảm            │
         │ - Xác định action│    │ - BookingService │    │ - Check quyền   │
         │                  │    │ - ShowtimeService│    │ - Trả response  │
         └──────────────────┘    └──────────────────┘    └────────┬─────────┘
                                                                  │
                                                                  ▼
                                                        ┌──────────────────┐
                                                        │  ChatbotResponse │
                                                        │  → Frontend      │
                                                        │  → Hiển thị user │
                                                        └──────────────────┘
```

### Chi tiết từng bước:

1. **User** nhập tin nhắn trong ChatbotWidget
2. **Frontend** gửi `POST /api/chatbot/message` với JWT trong header Authorization
3. **ChatController** trích xuất userId & role từ JWT (nếu không có JWT → Guest)
4. **FilterNode** kiểm tra message:
   - Có chứa SQL keywords? → BLOCKED
   - Có hỏi về system/API key? → BLOCKED
   - Có ngoài phạm vi rạp phim? → BLOCKED
5. **IntentClassifierNode** gọi Gemini để phân loại intent (VD: `BOOK_TICKET`)
6. **PermissionNode** kiểm tra: role hiện tại có quyền thực hiện intent này không?
7. **AssistantNode** xây dựng prompt phù hợp, gọi Gemini để tạo response + xác định action
8. **ExecutorNode** gọi service thật trong Spring Boot để lấy data (nếu cần)
9. **CheckerNode** kiểm tra response cuối, loại bỏ thông tin nhạy cảm
10. **Response** trả về frontend hiển thị cho user

---

## 5. Phân quyền Chatbot theo Role

### Ma trận quyền

| Intent | Guest | User | Staff | Admin |
|--------|:-----:|:----:|:-----:|:-----:|
| `SEARCH_MOVIE` | ✅ | ✅ | ✅ | ✅ |
| `VIEW_SHOWTIME` | ✅ | ✅ | ✅ | ✅ |
| `CHECK_SEAT` | ✅ | ✅ | ✅ | ✅ |
| `ASK_PROMOTION` | ✅ | ✅ | ✅ | ✅ |
| `ASK_PRICE` | ✅ | ✅ | ✅ | ✅ |
| `ASK_POLICY` | ✅ | ✅ | ✅ | ✅ |
| `GENERAL_CHAT` | ✅ | ✅ | ✅ | ✅ |
| `BOOK_TICKET` | ❌ | ✅ | ✅ | ✅ |
| `VIEW_MY_TICKETS` | ❌ | ✅ | ✅ | ✅ |
| `CANCEL_TICKET` | ❌ | ✅ | ❌ | ✅ |
| `STAFF_CHECK_IN` | ❌ | ❌ | ✅ | ✅ |
| `VIEW_STATS` | ❌ | ❌ | ❌ | ✅ |
| `MANAGE_MOVIE` | ❌ | ❌ | ❌ | ✅ |

### Logic xác định role từ JWT:
- **Không có JWT** → `GUEST`
- **Có JWT, role = `CUSTOMER`** → `USER`
- **Có JWT, role = `CINEMA_STAFF`** → `STAFF`
- **Có JWT, role = `SYSTEM_ADMIN` / `CHAIN_ADMIN` / `CINEMA_MANAGER`** → `ADMIN`

### Response khi bị từ chối quyền:
- Guest hỏi đặt vé → *"Bạn cần đăng nhập để đặt vé. Bạn có muốn tôi hướng dẫn đăng nhập không?"*
- User hỏi check-in → *"Tính năng check-in chỉ dành cho nhân viên rạp."*
- Staff hỏi thống kê → *"Bạn cần quyền quản trị để xem thống kê."*

---

## 6. Các Action Chatbot nên có

### Nhóm 1: Thông tin công khai (Guest+)
| Action | Mô tả | Service gọi |
|--------|--------|-------------|
| `SEARCH_MOVIES` | Tìm phim theo tên/thể loại/đánh giá | `MovieService` |
| `GET_NOW_SHOWING` | Phim đang chiếu | `MovieService` |
| `GET_COMING_SOON` | Phim sắp chiếu | `MovieService` |
| `GET_SHOWTIMES` | Suất chiếu theo phim/rạp/ngày | `ShowtimeService` |
| `CHECK_SEATS` | Ghế trống theo suất chiếu | `SeatHoldService` |
| `GET_PROMOTIONS` | Khuyến mãi đang có | `PromotionService` |
| `GET_TICKET_PRICE` | Giá vé theo loại ghế/suất chiếu | `ShowtimeService` |
| `GET_CINEMA_INFO` | Thông tin rạp/chuỗi rạp | `CinemaService` |
| `ASK_POLICY` | Chính sách đổi/hủy vé | Trả text tĩnh |

### Nhóm 2: User đăng nhập (User+)
| Action | Mô tả | Service gọi |
|--------|--------|-------------|
| `VIEW_MY_BOOKINGS` | Xem danh sách vé đã đặt | `BookingService` |
| `VIEW_BOOKING_DETAIL` | Chi tiết 1 booking | `BookingService` |
| `CANCEL_BOOKING` | Hủy vé (nếu hợp lệ) | `BookingService` |
| `GET_MY_POINTS` | Xem điểm loyalty | `LoyaltyPointsService` |

### Nhóm 3: Staff (Staff+)
| Action | Mô tả | Service gọi |
|--------|--------|-------------|
| `STAFF_LOOKUP_BOOKING` | Tra cứu booking theo mã | `BookingService` |
| `STAFF_CHECK_IN` | Check-in vé | `TicketCheckInService` |

### Nhóm 4: Admin only
| Action | Mô tả | Service gọi |
|--------|--------|-------------|
| `VIEW_REVENUE_STATS` | Thống kê doanh thu | `ReportService` |
| `VIEW_BOOKING_STATS` | Thống kê đặt vé | `BookingService` |

---

## 7. Lưu ý bảo mật khi dùng API key bên ngoài

### 7.1. Bảo vệ API Key
- ✅ API key Gemini **chỉ nằm trong** `application.properties` hoặc biến môi trường `GEMINI_API_KEY`
- ✅ Frontend **KHÔNG BAO GIỜ** biết API key
- ✅ Frontend chỉ gọi `POST /api/chatbot/message` → backend gọi Gemini
- ⚠️ **QUAN TRỌNG**: Xóa API key hardcode hiện tại trong `application.properties` dòng 74 (đang lộ key thật!)
- ✅ Dùng biến môi trường: `gemini.api.key=${GEMINI_API_KEY:}`
- ✅ Trong production, set biến môi trường qua Docker/server, không commit vào Git

### 7.2. Chống Prompt Injection (FilterNode)

**Blacklist keywords:**
```
SELECT, INSERT, UPDATE, DELETE, DROP, ALTER, CREATE TABLE, 
system prompt, ignore previous, API key, database, repository, 
application.properties, password, token, secret
```

**Regex patterns chặn:**
```regex
# SQL Injection
/(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+/i

# System Prompt Leak
/(system\s*prompt|ignore\s*(all\s*)?previous|forget\s*(all\s*)?instructions)/i

# Sensitive Info Leak
/(api\s*key|database|schema|table\s*name|password|secret)/i
```

**Ngoài phạm vi:** Dùng Gemini đánh giá nhanh: "Câu hỏi này có liên quan đến rạp phim/phim/vé/suất chiếu không?" → Yes/No

### 7.3. CheckerNode — Kiểm tra Response cuối
- Loại bỏ mọi chuỗi giống email (trừ của user hiện tại)
- Loại bỏ password hash, token, API key trong response
- Loại bỏ SQL query nếu AI vô tình trả ra
- Đảm bảo user chỉ thấy dữ liệu của chính mình (bookings, tickets)

### 7.4. Rate Limiting (đề xuất)
- **User đăng nhập**: 10 request/phút
- **Guest (theo IP)**: 5 request/phút
- Tránh lạm dụng API Gemini (tốn chi phí)

### 7.5. Logging & Monitoring
- Log tất cả request chatbot (không log nội dung nhạy cảm)
- Monitor số lượng request bị FilterNode chặn → phát hiện tấn công
- Alert khi rate limit bị vượt quá

---

## Tổng kết các file cần thay đổi

### Backend (14 files mới + 3 files sửa = 17 files)

| Loại | File | Vai trò |
|------|------|---------|
| [MỚI] | `chatbot/ChatbotOrchestrator.java` | Điều phối pipeline |
| [MỚI] | `chatbot/node/FilterNode.java` | Chặn prompt injection |
| [MỚI] | `chatbot/node/IntentClassifierNode.java` | Phân loại intent |
| [MỚI] | `chatbot/node/PermissionNode.java` | Kiểm tra quyền |
| [MỚI] | `chatbot/node/AssistantNode.java` | Xử lý hội thoại AI |
| [MỚI] | `chatbot/node/ExecutorNode.java` | Gọi service thật |
| [MỚI] | `chatbot/node/CheckerNode.java` | Kiểm tra response |
| [MỚI] | `chatbot/dto/ChatbotRequest.java` | DTO request mới |
| [MỚI] | `chatbot/dto/ChatbotResponse.java` | DTO response mới |
| [MỚI] | `chatbot/dto/ChatContext.java` | Context pipeline |
| [MỚI] | `chatbot/dto/ChatAction.java` | Action result |
| [MỚI] | `chatbot/enums/ChatIntent.java` | Enum intent |
| [MỚI] | `chatbot/enums/ChatRole.java` | Enum role chatbot |
| [MỚI] | `chatbot/config/ChatbotPromptConfig.java` | Prompt templates |
| [SỬA] | `api/ChatController.java` | Thêm endpoint mới |
| [SỬA] | `config/SecurityConfig.java` | Thêm security cho chatbot |
| [SỬA] | `service/GeminiChatService.java` | Refactor thành AI client |

### Frontend (6 files mới + 1 file sửa = 7 files)

| Loại | File | Vai trò |
|------|------|---------|
| [MỚI] | `services/chatbotService.js` | API calls chatbot |
| [MỚI] | `Chatbot/ChatbotWidget.js` | Component chính |
| [MỚI] | `Chatbot/ChatbotWidget.css` | Styles |
| [MỚI] | `Chatbot/ChatMessage.js` | Render message |
| [MỚI] | `Chatbot/ChatActionCard.js` | Render action results |
| [MỚI] | `Chatbot/QuickActions.js` | Gợi ý theo role |
| [SỬA] | `GeminiChatbot.js` | Wrapper backward compatible |
