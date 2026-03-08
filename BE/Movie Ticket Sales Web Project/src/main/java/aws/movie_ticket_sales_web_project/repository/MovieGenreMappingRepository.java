package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.MovieGenreMapping;
import aws.movie_ticket_sales_web_project.entity.MovieGenreMappingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieGenreMappingRepository extends JpaRepository<MovieGenreMapping, MovieGenreMappingId> {
    
    @Query("SELECT mgm FROM MovieGenreMapping mgm " +
           "JOIN FETCH mgm.genre g " +
           "WHERE mgm.movie.id = :movieId")
    List<MovieGenreMapping> findByMovieIdWithGenre(@Param("movieId") Integer movieId);
}