package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.RefundMethod;
import aws.movie_ticket_sales_web_project.enums.RefundReason;
import aws.movie_ticket_sales_web_project.enums.RefundStatus;
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
@Table(name = "refunds")
public class Refund {
    @Id
    @Column(name = "refund_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "refund_reference", nullable = false)
    private String refundReference;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_method", nullable = false)
    private RefundMethod refundMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private RefundReason reason;

    @Lob
    @Column(name = "reason_description", columnDefinition = "TEXT")
    private String reasonDescription;

    @ColumnDefault("'PENDING'")
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RefundStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "gateway_refund_id")
    private String gatewayRefundId;

    @Column(name = "gateway_response")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> gatewayResponse;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}