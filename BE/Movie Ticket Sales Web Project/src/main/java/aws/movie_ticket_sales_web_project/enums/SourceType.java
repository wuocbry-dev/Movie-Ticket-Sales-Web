package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing the source type of points transactions
 */
public enum SourceType {
    BOOKING,      // Từ đặt vé
    BONUS,        // Thưởng
    BIRTHDAY,     // Sinh nhật
    REFERRAL,     // Giới thiệu
    PROMOTION,    // Khuyến mãi
    MANUAL,       // Thủ công
    CONCESSION    // Từ mua bắp nước
}