package aws.movie_ticket_sales_web_project.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kết quả action từ ExecutorNode.
 * Chứa dữ liệu thật từ service và metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAction {
    private String actionType;      // Loại action (VD: "SEARCH_MOVIES", "VIEW_MY_BOOKINGS")
    private boolean success;        // Action thành công hay không
    private String message;         // Message mô tả kết quả
    private Object data;            // Dữ liệu trả về (List<Movie>, List<Booking>...)
    private int resultCount;        // Số lượng kết quả
}
