package aws.movie_ticket_sales_web_project.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO cho chatbot API mới.
 * Mở rộng so với ChatResponse cũ, hỗ trợ nhiều loại action data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    private String message;                             // Tin nhắn trả lời chính
    private String conversationId;                      // ID cuộc hội thoại
    private String intent;                              // Intent đã phân loại (VD: "SEARCH_MOVIE")
    private String actionType;                          // Loại action đã thực hiện
    private Object actionData;                          // Dữ liệu action (phim, vé, suất chiếu...)
    private List<MovieRecommendation> recommendations;  // Gợi ý phim (backward compatible)
    private List<String> suggestedActions;               // Gợi ý hành động tiếp theo cho user

    /**
     * Inner class cho gợi ý phim (giữ tương thích với ChatResponse cũ).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieRecommendation {
        private Integer movieId;
        private String title;
        private String posterUrl;
        private Double rating;
        private Integer durationMinutes;
        private String reason;
    }
}
