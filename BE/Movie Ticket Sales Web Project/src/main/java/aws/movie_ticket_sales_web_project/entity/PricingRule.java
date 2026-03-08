package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.RuleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "pricing_rules")
public class PricingRule {
    @Id
    @Column(name = "rule_id", nullable = false)
    private Integer id;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "conditions")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> conditions;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "applies_to")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> appliesTo;

    @ColumnDefault("0")
    @Column(name = "priority")
    private Integer priority;

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