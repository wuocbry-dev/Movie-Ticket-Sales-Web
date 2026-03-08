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
public class ChatResponse {
    private String message;
    private List<MovieRecommendation> recommendations;
    
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
