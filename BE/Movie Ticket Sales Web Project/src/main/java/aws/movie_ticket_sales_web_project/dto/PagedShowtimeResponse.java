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
public class PagedShowtimeResponse {
    @JsonProperty("totalElements")
    private Long totalElements;
    
    @JsonProperty("totalPages")
    private Integer totalPages;
    
    @JsonProperty("currentPage")
    private Integer currentPage;
    
    @JsonProperty("pageSize")
    private Integer pageSize;
    
    @JsonProperty("hasNext")
    private Boolean hasNext;
    
    @JsonProperty("hasPrevious")
    private Boolean hasPrevious;
    
    @JsonProperty("data")
    private List<ShowtimeDto> data;
}
