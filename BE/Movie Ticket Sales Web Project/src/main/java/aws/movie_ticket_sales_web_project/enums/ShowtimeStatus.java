package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different showtime statuses
 */
public enum ShowtimeStatus {
    SCHEDULED,  // Đã lên lịch
    SELLING,    // Đang bán vé
    SOLD_OUT,   // Đã bán hết
    CANCELLED   // Đã hủy
}