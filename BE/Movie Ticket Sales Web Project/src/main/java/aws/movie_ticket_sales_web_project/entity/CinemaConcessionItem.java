package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cinema_concession_items", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"cinema_id", "item_id"}))
public class CinemaConcessionItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_item_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private ConcessionItem item;

    /**
     * Giá bán tại rạp này (ghi đè giá mặc định trong concession_items)
     * Nếu null thì dùng giá mặc định
     */
    @Column(name = "cinema_price", precision = 10, scale = 2)
    private BigDecimal cinemaPrice;

    /**
     * Giá vốn tại rạp này (có thể khác nhau do chi phí vận chuyển, nhập hàng địa phương)
     */
    @Column(name = "cinema_cost_price", precision = 10, scale = 2)
    private BigDecimal cinemaCostPrice;

    /**
     * Số lượng tồn kho tại rạp
     */
    @ColumnDefault("0")
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    /**
     * Sản phẩm có bán tại rạp này không
     */
    @ColumnDefault("1")
    @Column(name = "is_available")
    private Boolean isAvailable;

    /**
     * Thứ tự hiển thị tại rạp này
     */
    @ColumnDefault("0")
    @Column(name = "display_order")
    private Integer displayOrder;

    /**
     * Ghi chú riêng cho rạp (VD: "Giá khuyến mãi cuối tuần", "Hết hàng tạm thời")
     */
    @Column(name = "notes", length = 500)
    private String notes;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Lấy giá bán thực tế (ưu tiên giá rạp, không có thì dùng giá mặc định)
     */
    public BigDecimal getEffectivePrice() {
        return cinemaPrice != null ? cinemaPrice : item.getPrice();
    }

    /**
     * Lấy giá vốn thực tế
     */
    public BigDecimal getEffectiveCostPrice() {
        return cinemaCostPrice != null ? cinemaCostPrice : item.getCostPrice();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (isAvailable == null) {
            isAvailable = true;
        }
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
        if (displayOrder == null) {
            displayOrder = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
