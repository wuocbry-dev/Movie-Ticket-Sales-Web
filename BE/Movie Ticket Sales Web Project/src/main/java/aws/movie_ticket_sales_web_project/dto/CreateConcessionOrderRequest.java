package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho request tạo đơn hàng bắp nước
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConcessionOrderRequest {
    private Integer userId;
    private Integer cinemaId;
    private Integer showtimeId;  // Optional: nếu mua kèm với vé
    private String notes;
    private List<OrderItemRequest> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private Integer itemId;
        private Integer quantity;
        private String notes;
    }
}
