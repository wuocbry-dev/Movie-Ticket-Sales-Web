package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, Integer> {
    Optional<MembershipTier> findByTierName(String tierName);
    Optional<MembershipTier> findByTierLevel(Integer tierLevel);
}
