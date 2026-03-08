package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
    
    // Find movies excluding soft deleted ones
    @Query("SELECT m FROM Movie m WHERE m.isDeleted = false OR m.isDeleted IS NULL")
    Page<Movie> findAllActive(Pageable pageable);
    
    Page<Movie> findByStatusAndIsDeletedFalse(MovieStatus status, Pageable pageable);
    
    Page<Movie> findByStatus(MovieStatus status, Pageable pageable);
    
    // For chatbot - get all movies by status without pagination
    @Query("SELECT m FROM Movie m WHERE m.status = :status AND (m.isDeleted = false OR m.isDeleted IS NULL)")
    java.util.List<Movie> findByStatus(@Param("status") MovieStatus status);
    
    @Query("SELECT m FROM Movie m WHERE " +
           "(m.isDeleted = false OR m.isDeleted IS NULL) AND " +
           "(:status IS NULL OR m.status = :status)")
    Page<Movie> findMoviesWithFilters(@Param("status") MovieStatus status, 
                                     Pageable pageable);
}