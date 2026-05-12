package aws.movie_ticket_sales_web_project.chatbot.dto;

import aws.movie_ticket_sales_web_project.chatbot.enums.ChatIntent;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Context object truyền giữa các node trong pipeline chatbot.
 * Mỗi node đọc/ghi thông tin cần thiết vào context này.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatContext {
    // === Input ===
    private String userMessage;         // Message gốc từ user
    private String conversationId;      // ID cuộc hội thoại

    // === User Info (từ JWT) ===
    private Integer userId;             // Từ JWT (null = Guest)
    private String userEmail;           // Email user (từ JWT)
    private ChatRole chatRole;          // Role đã map: GUEST/USER/STAFF/ADMIN

    // === FilterNode output ===
    private boolean filtered;           // true nếu message bị chặn
    private String filterReason;        // Lý do chặn (nếu có)

    // === IntentClassifierNode output ===
    private ChatIntent intent;          // Intent đã phân loại

    // === PermissionNode output ===
    private boolean permissionGranted;  // true nếu có quyền thực hiện intent

    // === AssistantNode output ===
    private String assistantResponse;   // Response từ AI
    private String actionToExecute;     // Action cần Executor thực hiện (nullable)

    // === ExecutorNode output ===
    private Object executorResult;      // Dữ liệu thật từ service

    // === CheckerNode output ===
    private String finalResponse;       // Response cuối cùng (đã kiểm tra)
    private Object finalActionData;     // Action data cuối cùng (đã kiểm tra)
}
