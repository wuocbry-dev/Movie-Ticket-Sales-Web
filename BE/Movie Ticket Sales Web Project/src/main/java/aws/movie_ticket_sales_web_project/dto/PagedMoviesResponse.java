package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedMoviesResponse {
    private List<MovieListItemDto> content;
    private Long totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer size;
}