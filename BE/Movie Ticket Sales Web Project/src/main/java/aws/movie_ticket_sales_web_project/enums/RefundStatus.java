package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different refund statuses
 */
public enum RefundStatus {
    PENDING,     // Đang chờ xử lý
    PROCESSING,  // Đang xử lý
    COMPLETED,   // Đã hoàn thành
    FAILED       // Thất bại
}