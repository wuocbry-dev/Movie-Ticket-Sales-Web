package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.AgeRating;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CreateMovieRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String titleEn;
    
    @NotNull(message = "Age rating is required")
    private AgeRating ageRating;
    
    private String contentWarning;
    
    private String synopsis;
    
    private String synopsisEn;
    
    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;
    
    private LocalDate releaseDate;
    
    private LocalDate endDate;
    
    @NotNull(message = "Status is required")
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
