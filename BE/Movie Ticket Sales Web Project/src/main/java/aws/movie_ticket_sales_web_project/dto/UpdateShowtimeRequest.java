package aws.movie_ticket_sales_web_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShowtimeRequest {
    @JsonProperty("showtimeId")
    private Integer showtimeId;
    
    @JsonProperty("movieId")
    private Integer movieId;
    
    @JsonProperty("hallId")
    private Integer hallId;
    
    @JsonProperty("showDate")
    private LocalDate showDate;
    
    @JsonProperty("startTime")
    private LocalTime startTime;
    
    @JsonProperty("endTime")
    private LocalTime endTime;
    
    @JsonProperty("formatType")
    private String formatType;
    
    @JsonProperty("subtitleLanguage")
    private String subtitleLanguage;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("basePrice")
    private BigDecimal basePrice;
}
