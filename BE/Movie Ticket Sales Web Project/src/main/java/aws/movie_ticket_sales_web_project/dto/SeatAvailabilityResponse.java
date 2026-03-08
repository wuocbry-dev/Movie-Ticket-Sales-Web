package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {
    private Integer showtimeId;
    private Integer hallId;
    private List<Integer> availableSeatIds;
    private List<SeatHoldInfo> heldSeats;
    private List<SeatInfo> seats; // Danh sách tất cả ghế với thông tin đầy đủ
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatHoldInfo {
        private Integer seatId;
        private String heldBy; // "you" or "another_user"
        private Long expiresAt; // Epoch milliseconds
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfo {
        private Integer seatId;
        private String seatRow;
        private Integer seatNumber;
        private String seatType; // STANDARD, VIP, COUPLE, WHEELCHAIR
        private String status; // AVAILABLE, HELD, SOLD, BOOKED
        private String sessionId; // ID của session đang giữ (nếu HELD)
        private Integer positionX;
        private Integer positionY;
    }
}
