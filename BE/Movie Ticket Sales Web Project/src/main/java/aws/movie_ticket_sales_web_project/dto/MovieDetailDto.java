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
public class MovieDetailDto {
    private Integer movieId;
    private String title;
    private String titleEn;
    private String ageRating;
    private String contentWarning;
    private String synopsis;
    private String synopsisEn;
    private Integer duration;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private String country;
    private String language;
    private String subtitleLanguage;
    private String director;
    private String cast;
    private String producer;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private String status;
    private Boolean isFeatured;
    private List<GenreDto> genres;
    private List<String> availableFormats;
    private BigDecimal imdbRating;
    private String imdbId;
}