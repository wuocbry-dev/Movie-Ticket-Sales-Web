package aws.movie_ticket_sales_web_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaHallDto {
    @JsonProperty("hallId")
    private Integer hallId;

    @JsonProperty("cinemaId")
    private Integer cinemaId;

    @JsonProperty("cinemaName")
    private String cinemaName;

    @JsonProperty("hallName")
    private String hallName;

    @JsonProperty("hallType")
    private String hallType;

    @JsonProperty("totalSeats")
    private Integer totalSeats;

    @JsonProperty("rowsCount")
    private Integer rowsCount;

    @JsonProperty("seatsPerRow")
    private Integer seatsPerRow;

    @JsonProperty("screenType")
    private String screenType;

    @JsonProperty("soundSystem")
    private String soundSystem;

    @JsonProperty("seatLayout")
    private Map<String, Object> seatLayout;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("createdAt")
    private Instant createdAt;

    @JsonProperty("updatedAt")
    private Instant updatedAt;
}
