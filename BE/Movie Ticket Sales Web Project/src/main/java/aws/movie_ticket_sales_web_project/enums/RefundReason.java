package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different refund reasons
 */
public enum RefundReason {
    CUSTOMER_REQUEST,    // Yêu cầu của khách hàng
    SHOWTIME_CANCELLED,  // Suất chiếu bị hủy
    TECHNICAL_ERROR,     // Lỗi kỹ thuật
    FRAUD                // Gian lận
}