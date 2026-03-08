package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.AgeRating;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMovieRequest {
    
    private String title;
    
    private String titleEn;
    
    private AgeRating ageRating;
    
    private String contentWarning;
    
    private String synopsis;
    
    private String synopsisEn;
    
    private Integer durationMinutes;
    
    private LocalDate releaseDate;
    
    private LocalDate endDate;
    
    private MovieStatus status;
    
    private String director;
    
    private String cast;
    
    private String country;
    
    private String language;
    
    private String subtitleLanguage;
    
    private String producer;
    
    private String posterUrl;
    
    private String backdropUrl;
    
    private String trailerUrl;
    
    private java.math.BigDecimal imdbRating;
    
    private String imdbId;
    
    private List<Integer> genreIds;
    
    private List<String> availableFormats;
    
    private Boolean isFeatured;
}
