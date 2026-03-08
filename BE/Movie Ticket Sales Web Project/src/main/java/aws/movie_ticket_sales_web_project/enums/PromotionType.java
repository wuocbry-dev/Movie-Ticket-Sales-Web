package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different promotion types
 */
public enum PromotionType {
    PERCENTAGE,        // Giảm theo phần trăm
    FIXED_AMOUNT,      // Giảm số tiền cố định
    BUY_X_GET_Y,       // Mua X tặng Y
    FREE_ITEM,         // Tặng sản phẩm
    POINTS_MULTIPLIER  // Nhân điểm thưởng
}