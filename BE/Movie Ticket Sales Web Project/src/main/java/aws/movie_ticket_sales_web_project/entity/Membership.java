package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.MembershipStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "memberships")
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "membership_number", nullable = false, length = 50)
    private String membershipNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tier_id", nullable = false)
    private MembershipTier tier;

    @ColumnDefault("0")
    @Column(name = "total_points")
    private Integer totalPoints;

    @ColumnDefault("0")
    @Column(name = "available_points")
    private Integer availablePoints;

    @ColumnDefault("0.00")
    @Column(name = "lifetime_spending", precision = 12, scale = 2)
    private BigDecimal lifetimeSpending;

    @ColumnDefault("0.00")
    @Column(name = "annual_spending", precision = 12, scale = 2)
    private BigDecimal annualSpending;

    @ColumnDefault("0")
    @Column(name = "total_visits")
    private Integer totalVisits;

    @Column(name = "tier_start_date")
    private LocalDate tierStartDate;

    @Column(name = "next_tier_review_date")
    private LocalDate nextTierReviewDate;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'ACTIVE'")
    @Lob
    @Column(name = "status",length = 20, columnDefinition = "ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED')")
    private MembershipStatus status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}