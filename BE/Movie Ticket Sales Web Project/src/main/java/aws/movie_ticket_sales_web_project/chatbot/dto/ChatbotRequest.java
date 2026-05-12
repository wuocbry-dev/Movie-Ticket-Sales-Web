package aws.movie_ticket_sales_web_project.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho chatbot API mới.
 * userId và role sẽ được trích xuất từ JWT ở backend, KHÔNG lấy từ body.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequest {
    private String message;           // Tin nhắn người dùng
    private String conversationId;    // ID cuộc hội thoại (optional, để theo dõi context)
}
