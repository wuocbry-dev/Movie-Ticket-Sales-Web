package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.PromotionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "promotions")
public class Promotion {
    @Id
    @Column(name = "promotion_id", nullable = false)
    private Integer id;

    @Column(name = "promotion_code", nullable = false, length = 100)
    private String promotionCode;

    @Column(name = "promotion_name", nullable = false)
    private String promotionName;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type", nullable = false)
    private PromotionType promotionType;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @ColumnDefault("0.00")
    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "applicable_to")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> applicableTo;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Column(name = "max_usage_total")
    private Integer maxUsageTotal;

    @ColumnDefault("1")
    @Column(name = "max_usage_per_user")
    private Integer maxUsagePerUser;

    @ColumnDefault("0")
    @Column(name = "current_usage")
    private Integer currentUsage;

    @Column(name = "target_user_segments")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> targetUserSegments;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

}