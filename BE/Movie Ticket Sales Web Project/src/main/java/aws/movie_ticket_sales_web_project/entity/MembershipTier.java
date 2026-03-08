package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "membership_tiers")
public class MembershipTier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id", nullable = false)
    private Integer id;

    @Column(name = "tier_name", nullable = false, length = 100)
    private String tierName;

    @Column(name = "tier_name_display", length = 100)
    private String tierNameDisplay;

    @ColumnDefault("0.00")
    @Column(name = "min_annual_spending", precision = 12, scale = 2)
    private BigDecimal minAnnualSpending;

    @ColumnDefault("0")
    @Column(name = "min_visits_per_year")
    private Integer minVisitsPerYear;

    @ColumnDefault("1.00")
    @Column(name = "points_earn_rate", precision = 5, scale = 2)
    private BigDecimal pointsEarnRate;

    @Lob
    @Column(name = "birthday_gift_description")
    private String birthdayGiftDescription;

    @ColumnDefault("0.00")
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @ColumnDefault("0")
    @Column(name = "free_tickets_per_year")
    private Integer freeTicketsPerYear;

    @ColumnDefault("0")
    @Column(name = "priority_booking")
    private Boolean priorityBooking;

    @ColumnDefault("0")
    @Column(name = "free_upgrades")
    private Boolean freeUpgrades;

    @Column(name = "tier_level", nullable = false)
    private Integer tierLevel;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}