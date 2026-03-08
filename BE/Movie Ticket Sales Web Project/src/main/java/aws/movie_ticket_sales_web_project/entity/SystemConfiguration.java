package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.DataType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "system_configurations")
public class SystemConfiguration {
    @Id
    @Column(name = "config_id", nullable = false)
    private Integer id;

    @Column(name = "config_key", nullable = false)
    private String configKey;

    @Lob
    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @ColumnDefault("'STRING'")
    @Enumerated(EnumType.STRING)
    @Column(name = "data_type")
    private DataType dataType;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "validation_rules")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> validationRules;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}