package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class MovieGenreMappingId implements Serializable {
    private static final long serialVersionUID = -2179077751647710643L;
    @Column(name = "movie_id", nullable = false)
    private Integer movieId;

    @Column(name = "genre_id", nullable = false)
    private Integer genreId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        MovieGenreMappingId entity = (MovieGenreMappingId) o;
        return Objects.equals(this.genreId, entity.genreId) &&
                Objects.equals(this.movieId, entity.movieId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(genreId, movieId);
    }

}