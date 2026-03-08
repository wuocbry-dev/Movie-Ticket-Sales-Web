package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "cinema_chains")
public class CinemaChain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chain_id", nullable = false)
    private Integer id;

    @Column(name = "chain_name", nullable = false)
    private String chainName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @Lob
    @Column(name = "description")
    private String description;

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