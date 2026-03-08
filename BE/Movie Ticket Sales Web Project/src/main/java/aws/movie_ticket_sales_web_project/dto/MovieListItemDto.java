package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieListItemDto {
    private Integer movieId;
    private String title;
    private String titleEn;
    private String ageRating;
    private Integer duration;
    private LocalDate releaseDate;
    private String status;
    private String posterUrl;
    private List<GenreDto> genres;
    private List<String> formats;
    private BigDecimal imdbRating;
    private Boolean isFeatured;
}