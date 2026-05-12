package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchDto {
    private List<MovieSummary> movies;
    private List<PromotionSummary> promotions;
    private List<ConcessionSummary> concessions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieSummary {
        private Integer id;
        private String title;
        private String posterUrl;
        private Integer duration;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionSummary {
        private Integer id;
        private String promotionName;
        private String promotionCode;
        private BigDecimal discountValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcessionSummary {
        private Integer id;
        private String itemName;
        private BigDecimal price;
        private String imageUrl;
    }
}
