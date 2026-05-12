package aws.movie_ticket_sales_web_project.chatbot.enums;

/**
 * Enum role cho chatbot, map từ role hệ thống sang role chatbot đơn giản hóa.
 */
public enum ChatRole {
    GUEST("Khách vãng lai"),
    USER("Người dùng đã đăng nhập"),
    STAFF("Nhân viên rạp"),
    ADMIN("Quản trị viên");

    private final String description;

    ChatRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Map từ role name hệ thống (trong DB) sang ChatRole.
     * - CUSTOMER → USER
     * - CINEMA_STAFF → STAFF
     * - SYSTEM_ADMIN, CHAIN_ADMIN, CINEMA_MANAGER → ADMIN
     * - Không có role / null → GUEST
     */
    public static ChatRole fromSystemRole(String systemRoleName) {
        if (systemRoleName == null || systemRoleName.isBlank()) {
            return GUEST;
        }

        return switch (systemRoleName.toUpperCase().trim()) {
            case "CUSTOMER" -> USER;
            case "CINEMA_STAFF" -> STAFF;
            case "SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "ADMIN" -> ADMIN;
            default -> GUEST;
        };
    }
}
