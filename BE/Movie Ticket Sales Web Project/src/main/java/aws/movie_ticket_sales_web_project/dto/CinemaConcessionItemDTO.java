package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho concession item tại một rạp cụ thể
 * Bao gồm thông tin về giá và tồn kho tại rạp đó
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaConcessionItemDTO {
    
    private Integer cinemaItemId;
    private Integer cinemaId;
    private String cinemaName;
    private Integer itemId;
    private String itemName;
    private String description;
    private Integer categoryId;
    private String categoryName;
    private String imageUrl;
    private String size;
    private Integer calories;
    
    // Pricing
    private BigDecimal defaultPrice;      // Giá gốc từ concession_items
    private BigDecimal cinemaPrice;       // Giá riêng tại rạp (null nếu dùng giá gốc)
    private BigDecimal effectivePrice;    // Giá thực tế áp dụng
    private BigDecimal cinemaCostPrice;   // Giá vốn tại rạp
    
    // Stock & Availability
    private Integer stockQuantity;
    private Boolean isAvailable;          // Có bán tại rạp này không
    private Boolean itemActive;           // Item còn active trong hệ thống không
    
    // Display
    private Integer displayOrder;
    private String notes;                 // Ghi chú riêng cho rạp
    
    // Combo info (if applicable)
    private Boolean isCombo;
    
    /**
     * Kiểm tra item có giá khác với giá mặc định không
     */
    public boolean hasCustomPrice() {
        return cinemaPrice != null && !cinemaPrice.equals(defaultPrice);
    }
    
    /**
     * Tính % chênh lệch giá so với giá gốc
     */
    public Double getPriceDiscountPercent() {
        if (cinemaPrice == null || defaultPrice == null || defaultPrice.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        BigDecimal diff = defaultPrice.subtract(cinemaPrice);
        return diff.divide(defaultPrice, 4, java.math.RoundingMode.HALF_UP)
                   .multiply(new BigDecimal("100"))
                   .doubleValue();
    }
    
    /**
     * Kiểm tra có giảm giá không
     */
    public boolean isDiscounted() {
        return hasCustomPrice() && cinemaPrice.compareTo(defaultPrice) < 0;
    }
    
    /**
     * Kiểm tra tồn kho có thấp không
     */
    public boolean isLowStock() {
        return stockQuantity != null && stockQuantity < 20;
    }
    
    /**
     * Kiểm tra hết hàng
     */
    public boolean isOutOfStock() {
        return stockQuantity != null && stockQuantity <= 0;
    }
}
