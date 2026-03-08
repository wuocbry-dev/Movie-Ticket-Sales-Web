package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    
    private Integer userId; // Optional - for registered users
    
    @NotNull(message = "Showtime ID is required")
    private Integer showtimeId;
    
    // Customer information (required ONLY if userId is null - for guest bookings)
    @Size(max = 100, message = "Customer name must not exceed 100 characters")
    private String customerName;
    
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    @Pattern(regexp = "^[0-9]{10,20}$", message = "Invalid phone number format")
    private String customerPhone;
    
    // Seat selection
    @NotEmpty(message = "At least one seat must be selected")
    private List<Integer> seatIds;
    
    // Session ID for seat hold verification
    @NotBlank(message = "Session ID is required")
    private String sessionId;
    
    // Optional voucher/discount
    private String voucherCode;
    
    // Points to redeem for discount (optional)
    // 1 point = 1000 VND discount
    @Min(value = 0, message = "Points to use must be non-negative")
    private Integer pointsToUse;
    
    // Payment
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    // Concession items (optional)
    private List<ConcessionItemRequest> concessionItems;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcessionItemRequest {
        @NotNull(message = "Item ID is required")
        private Integer itemId;
        
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        private java.math.BigDecimal price;
    }
}

