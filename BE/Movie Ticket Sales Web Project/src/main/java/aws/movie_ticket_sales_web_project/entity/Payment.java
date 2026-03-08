package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.PaymentMethod;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
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
@Table(name = "payments")
public class Payment {
    @Id
    @Column(name = "payment_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concession_order_id")
    private ConcessionOrder concessionOrder;

    @Column(name = "payment_reference", nullable = false)
    private String paymentReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_provider", length = 100)
    private String paymentProvider;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ColumnDefault("'VND'")
    @Column(name = "currency", length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Lob
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_response")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> gatewayResponse;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "initiated_at")
    private Instant initiatedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Lob
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Lob
    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}