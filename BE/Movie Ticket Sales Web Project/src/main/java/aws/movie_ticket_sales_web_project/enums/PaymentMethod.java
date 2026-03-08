package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different payment methods
 */
public enum PaymentMethod {
    CREDIT_CARD,   // Thẻ tín dụng
    DEBIT_CARD,    // Thẻ ghi nợ
    BANK_TRANSFER, // Chuyển khoản ngân hàng
    E_WALLET,      // Ví điện tử
    CASH,          // Tiền mặt
    POINTS,        // Điểm thưởng
    VOUCHER        // Voucher
}