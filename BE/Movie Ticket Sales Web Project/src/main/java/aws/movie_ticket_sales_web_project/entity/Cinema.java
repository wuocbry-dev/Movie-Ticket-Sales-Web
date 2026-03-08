package aws.movie_ticket_sales_web_project.entity;

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
@Table(name = "cinemas")
public class Cinema {
    @Id
    @Column(name = "cinema_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chain_id")
    private CinemaChain chain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "cinema_name", nullable = false)
    private String cinemaName;

    @Lob
    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "opening_hours")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> openingHours;

    @Column(name = "facilities")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> facilities;

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