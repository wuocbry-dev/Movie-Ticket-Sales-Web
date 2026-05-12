package aws.movie_ticket_sales_web_project.chatbot.enums;

/**
 * Enum các intent (ý định) mà chatbot có thể phân loại từ tin nhắn user.
 */
public enum ChatIntent {
    // === Nhóm 1: Thông tin công khai (Guest+) ===
    SEARCH_MOVIE("Tìm phim"),
    VIEW_SHOWTIME("Xem suất chiếu"),
    CHECK_SEAT("Kiểm tra ghế trống"),
    ASK_PROMOTION("Hỏi khuyến mãi"),
    ASK_PRICE("Hỏi giá vé"),
    ASK_POLICY("Hỏi chính sách"),
    GET_CINEMA_INFO("Thông tin rạp"),

    // === Nhóm 2: User đăng nhập (User+) ===
    BOOK_TICKET("Đặt vé"),
    VIEW_MY_TICKETS("Xem vé của tôi"),
    CANCEL_TICKET("Hủy vé"),
    VIEW_MY_POINTS("Xem điểm loyalty"),

    // === Nhóm 3: Staff ===
    STAFF_CHECK_IN("Check-in vé"),
    STAFF_LOOKUP_BOOKING("Tra cứu booking"),

    // === Nhóm 4: Admin ===
    VIEW_STATS("Xem thống kê"),
    MANAGE_MOVIE("Quản lý phim"),

    // === Đặc biệt ===
    GENERAL_CHAT("Chat chung"),
    BLOCKED("Bị chặn");

    private final String description;

    ChatIntent(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
