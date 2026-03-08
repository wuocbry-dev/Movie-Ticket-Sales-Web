package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "concession_orders")
public class ConcessionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "concession_order_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "order_number", nullable = false, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(name = "pickup_time")
    private Instant pickupTime;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @ColumnDefault("0.00")
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @ColumnDefault("0.00")
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PENDING'")
    @Lob
    @Column(name = "status", length = 20, columnDefinition = "ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')")
    private ConcessionOrderStatus status;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PENDING'")
    @Lob
    @Column(name = "payment_status", length = 20, columnDefinition = "ENUM('PENDING', 'PAID', 'REFUNDED')")
    private PaymentStatus paymentStatus;

    @Lob
    @Column(name = "notes")
    private String notes;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}