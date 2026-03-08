package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different refund methods
 */
public enum RefundMethod {
    ORIGINAL_PAYMENT, // Hoàn về phương thức thanh toán gốc
    BANK_TRANSFER,    // Chuyển khoản ngân hàng
    POINTS,           // Hoàn điểm
    GIFT_CARD         // Thẻ quà tặng
}