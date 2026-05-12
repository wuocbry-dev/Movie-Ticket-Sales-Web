package aws.movie_ticket_sales_web_project.chatbot.node;

import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatIntent;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * PermissionNode — Node 4: Kiểm tra quyền theo user role.
 * 
 * So sánh intent yêu cầu với role hiện tại.
 * Trả về ALLOWED hoặc DENIED kèm message gợi ý.
 */
@Component
@Slf4j
public class PermissionNode {

    /**
     * Ma trận quyền: mỗi role được phép thực hiện những intent nào.
     */
    private static final Map<ChatRole, Set<ChatIntent>> PERMISSION_MATRIX = Map.of(
        ChatRole.GUEST, EnumSet.of(
            ChatIntent.SEARCH_MOVIE,
            ChatIntent.VIEW_SHOWTIME,
            ChatIntent.CHECK_SEAT,
            ChatIntent.ASK_PROMOTION,
            ChatIntent.ASK_PRICE,
            ChatIntent.ASK_POLICY,
            ChatIntent.GET_CINEMA_INFO,
            ChatIntent.GENERAL_CHAT
        ),
        ChatRole.USER, EnumSet.of(
            ChatIntent.SEARCH_MOVIE,
            ChatIntent.VIEW_SHOWTIME,
            ChatIntent.CHECK_SEAT,
            ChatIntent.ASK_PROMOTION,
            ChatIntent.ASK_PRICE,
            ChatIntent.ASK_POLICY,
            ChatIntent.GET_CINEMA_INFO,
            ChatIntent.GENERAL_CHAT,
            ChatIntent.BOOK_TICKET,
            ChatIntent.VIEW_MY_TICKETS,
            ChatIntent.CANCEL_TICKET,
            ChatIntent.VIEW_MY_POINTS
        ),
        ChatRole.STAFF, EnumSet.of(
            ChatIntent.SEARCH_MOVIE,
            ChatIntent.VIEW_SHOWTIME,
            ChatIntent.CHECK_SEAT,
            ChatIntent.ASK_PROMOTION,
            ChatIntent.ASK_PRICE,
            ChatIntent.ASK_POLICY,
            ChatIntent.GET_CINEMA_INFO,
            ChatIntent.GENERAL_CHAT,
            ChatIntent.BOOK_TICKET,
            ChatIntent.VIEW_MY_TICKETS,
            ChatIntent.VIEW_MY_POINTS,
            ChatIntent.STAFF_CHECK_IN,
            ChatIntent.STAFF_LOOKUP_BOOKING
        ),
        ChatRole.ADMIN, EnumSet.allOf(ChatIntent.class) // Admin có tất cả quyền
    );

    /**
     * Message trả về khi bị từ chối quyền.
     */
    private static final Map<ChatIntent, String> DENIED_MESSAGES = Map.ofEntries(
        Map.entry(ChatIntent.BOOK_TICKET, 
            "🔒 Bạn cần đăng nhập để đặt vé. Bạn có muốn tôi hướng dẫn đăng nhập không?"),
        Map.entry(ChatIntent.VIEW_MY_TICKETS, 
            "🔒 Bạn cần đăng nhập để xem vé đã đặt. Hãy đăng nhập trước nhé!"),
        Map.entry(ChatIntent.CANCEL_TICKET, 
            "🔒 Bạn cần đăng nhập để hủy vé. Hãy đăng nhập trước nhé!"),
        Map.entry(ChatIntent.VIEW_MY_POINTS, 
            "🔒 Bạn cần đăng nhập để xem điểm thưởng."),
        Map.entry(ChatIntent.STAFF_CHECK_IN, 
            "🔒 Tính năng check-in chỉ dành cho nhân viên rạp."),
        Map.entry(ChatIntent.STAFF_LOOKUP_BOOKING, 
            "🔒 Tính năng tra cứu booking chỉ dành cho nhân viên rạp."),
        Map.entry(ChatIntent.VIEW_STATS, 
            "🔒 Bạn cần quyền quản trị để xem thống kê."),
        Map.entry(ChatIntent.MANAGE_MOVIE, 
            "🔒 Bạn cần quyền quản trị để quản lý phim.")
    );

    /**
     * Kiểm tra quyền. Set permissionGranted trong context.
     * @return ChatContext đã cập nhật
     */
    public ChatContext check(ChatContext context) {
        ChatRole role = context.getChatRole();
        ChatIntent intent = context.getIntent();

        if (role == null) role = ChatRole.GUEST;
        if (intent == null || intent == ChatIntent.BLOCKED) {
            context.setPermissionGranted(false);
            return context;
        }

        Set<ChatIntent> allowedIntents = PERMISSION_MATRIX.getOrDefault(role, 
            PERMISSION_MATRIX.get(ChatRole.GUEST));

        boolean granted = allowedIntents.contains(intent);
        context.setPermissionGranted(granted);

        if (!granted) {
            String deniedMsg = DENIED_MESSAGES.getOrDefault(intent, 
                "🔒 Xin lỗi, bạn không có quyền thực hiện thao tác này.");
            context.setFinalResponse(deniedMsg);
            log.warn("🚫 PermissionNode: DENIED - role={}, intent={}", role, intent);
        } else {
            log.info("✅ PermissionNode: ALLOWED - role={}, intent={}", role, intent);
        }

        return context;
    }
}
