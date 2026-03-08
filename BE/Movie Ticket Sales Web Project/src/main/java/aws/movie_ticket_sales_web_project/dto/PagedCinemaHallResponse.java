package aws.movie_ticket_sales_web_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedCinemaHallResponse {
    @JsonProperty("data")
    private List<CinemaHallDto> data;

    @JsonProperty("currentPage")
    private Integer currentPage;

    @JsonProperty("pageSize")
    private Integer pageSize;

    @JsonProperty("totalElements")
    private Long totalElements;

    @JsonProperty("totalPages")
    private Integer totalPages;

    @JsonProperty("hasNext")
    private Boolean hasNext;

    @JsonProperty("hasPrevious")
    private Boolean hasPrevious;
}
