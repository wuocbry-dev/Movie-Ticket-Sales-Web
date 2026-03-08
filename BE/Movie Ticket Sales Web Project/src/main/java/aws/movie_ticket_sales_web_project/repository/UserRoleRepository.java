package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
    List<UserRole> findByUserId(Integer userId);
    
    List<UserRole> findByRoleId(Integer roleId);
}
