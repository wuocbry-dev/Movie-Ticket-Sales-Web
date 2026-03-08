package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "movie_genres")
public class MovieGenre {
    @Id
    @Column(name = "genre_id", nullable = false)
    private Integer id;

    @Column(name = "genre_name", nullable = false, length = 100)
    private String genreName;

    @Column(name = "genre_name_en", length = 100)
    private String genreNameEn;

    @Lob
    @Column(name = "description")
    private String description;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

}