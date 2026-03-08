package aws.movie_ticket_sales_web_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeDto {
    @JsonProperty("showtimeId")
    private Integer showtimeId;
    
    @JsonProperty("movieId")
    private Integer movieId;
    
    @JsonProperty("movieTitle")
    private String movieTitle;
    
    @JsonProperty("moviePosterUrl")
    private String moviePosterUrl;
    
    @JsonProperty("hallId")
    private Integer hallId;
    
    @JsonProperty("hallName")
    private String hallName;
    
    @JsonProperty("cinemaId")
    private Integer cinemaId;
    
    @JsonProperty("cinemaName")
    private String cinemaName;
    
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
    
    @JsonProperty("availableSeats")
    private Integer availableSeats;
    
    @JsonProperty("basePrice")
    private BigDecimal basePrice;
    
    @JsonProperty("createdAt")
    private Instant createdAt;
    
    @JsonProperty("updatedAt")
    private Instant updatedAt;
}
