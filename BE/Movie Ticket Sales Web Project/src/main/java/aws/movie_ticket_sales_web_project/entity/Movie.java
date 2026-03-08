package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.AgeRating;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "movies")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id", nullable = false)
    private Integer id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "title_en")
    private String titleEn;

    @Enumerated(EnumType.STRING)
    @Lob
    @Column(name = "age_rating", nullable = false, length = 20, columnDefinition = "ENUM('P', 'K', 'T13', 'T16', 'T18')")
    private AgeRating ageRating;

    @Lob
    @Column(name = "content_warning", columnDefinition = "TEXT")
    private String contentWarning;

    @Lob
    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;

    @Lob
    @Column(name = "synopsis_en", columnDefinition = "TEXT")
    private String synopsisEn;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "language", length = 100)
    private String language;

    @Column(name = "subtitle_language", length = 100)
    private String subtitleLanguage;

    @Column(name = "director")
    private String director;

    @Lob
    @Column(name = "cast", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "producer")
    private String producer;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "backdrop_url", length = 500)
    private String backdropUrl;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @ColumnDefault("'COMING_SOON'")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MovieStatus status;

    @ColumnDefault("0")
    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "imdb_rating", precision = 3, scale = 1)
    private BigDecimal imdbRating;

    @Column(name = "imdb_id", length = 50)
    private String imdbId;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

}