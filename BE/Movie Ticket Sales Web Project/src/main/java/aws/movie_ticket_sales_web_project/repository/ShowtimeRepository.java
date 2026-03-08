package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Integer> {
    
    @Query("SELECT DISTINCT s.formatType FROM Showtime s WHERE s.movie.id = :movieId")
    List<FormatType> findDistinctFormatTypesByMovieId(@Param("movieId") Integer movieId);
    
    @Query("SELECT s FROM Showtime s " +
           "LEFT JOIN FETCH s.movie " +
           "LEFT JOIN FETCH s.hall h " +
           "LEFT JOIN FETCH h.cinema " +
           "WHERE s.movie.id = :movieId")
    List<Showtime> findByMovieIdWithDetails(@Param("movieId") Integer movieId);
    
    // Fallback query without JOIN FETCH if needed
    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId")
    List<Showtime> findByMovieId(@Param("movieId") Integer movieId);
    
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movie " +
           "JOIN FETCH s.hall h " +
           "JOIN FETCH h.cinema " +
           "WHERE s.id = :showtimeId")
    java.util.Optional<Showtime> findByIdWithDetails(@Param("showtimeId") Integer showtimeId);
    
    // Get showtimes for a specific cinema (for cinema manager filtering)
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movie " +
           "JOIN FETCH s.hall h " +
           "JOIN FETCH h.cinema c " +
           "WHERE c.id = :cinemaId")
    Page<Showtime> findByHallCinemaId(@Param("cinemaId") Integer cinemaId, Pageable pageable);
    
    // Get showtimes for all cinemas managed by a specific manager
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movie " +
           "JOIN FETCH s.hall h " +
           "JOIN FETCH h.cinema c " +
           "WHERE c.manager.id = :managerId")
    Page<Showtime> findByHallCinemaManagerId(@Param("managerId") Integer managerId, Pageable pageable);
}