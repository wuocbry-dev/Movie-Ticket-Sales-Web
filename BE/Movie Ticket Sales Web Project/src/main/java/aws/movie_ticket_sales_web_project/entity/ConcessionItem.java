package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "concession_items")
public class ConcessionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ConcessionCategory category;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "size", length = 50)
    private String size;

    @Column(name = "calories")
    private Integer calories;

    @Lob
    @Column(name = "ingredients")
    private String ingredients;

    @ColumnDefault("0")
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @ColumnDefault("5")
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @ColumnDefault("0")
    @Column(name = "is_combo")
    private Boolean isCombo;

    @Lob
    @Column(name = "combo_items")
    private String comboItems;

    @ColumnDefault("1")
    @Column(name = "is_available")
    private Boolean isAvailable;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "available_cinemas")
    private String availableCinemas;

    @ColumnDefault("0")
    @Column(name = "display_order")
    private Integer displayOrder;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}