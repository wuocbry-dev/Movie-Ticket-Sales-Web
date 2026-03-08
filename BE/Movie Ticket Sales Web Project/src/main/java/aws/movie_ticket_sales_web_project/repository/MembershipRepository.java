package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Integer> {
    Optional<Membership> findByUserId(Integer userId);
}
