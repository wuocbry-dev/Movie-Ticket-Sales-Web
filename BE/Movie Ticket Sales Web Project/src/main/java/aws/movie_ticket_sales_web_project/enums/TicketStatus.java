package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different ticket statuses
 */
public enum TicketStatus {
    BOOKED,    // Đã đặt
    PAID,      // Đã thanh toán
    USED,      // Đã sử dụng
    CANCELLED, // Đã hủy
    REFUNDED   // Đã hoàn tiền
}