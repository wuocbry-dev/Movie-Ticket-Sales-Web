package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @Column(name = "booking_code", nullable = false, length = 50)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "booking_date")
    private Instant bookingDate;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @ColumnDefault("0.00")
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @ColumnDefault("0.00")
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @ColumnDefault("0.00")
    @Column(name = "service_fee", precision = 10, scale = 2)
    private BigDecimal serviceFee;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PENDING'")
    @Lob
    @Column(name = "status", length = 50, columnDefinition = "ENUM('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'REFUNDED')")
    private StatusBooking status;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PENDING'")
    @Lob
    @Column(name = "payment_status", length = 50, columnDefinition = "ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')")
    private PaymentStatus paymentStatus;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "hold_expires_at")
    private Instant holdExpiresAt;

    @Column(name = "qr_code", length = 500)
    private String qrCode;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(name = "invoice_issued_at")
    private Instant invoiceIssuedAt;
    
    @ColumnDefault("0")
    @Column(name = "points_used")
    private Integer pointsUsed;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}