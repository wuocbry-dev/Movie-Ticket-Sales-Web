package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho đơn hàng bắp nước item
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcessionOrderItemDTO {
    private Integer orderItemId;
    private Integer itemId;
    private String itemName;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String notes;
}
