package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.MovieGenre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieGenreRepository extends JpaRepository<MovieGenre, Integer> {
    List<MovieGenre> findByIsActiveTrue();
}
