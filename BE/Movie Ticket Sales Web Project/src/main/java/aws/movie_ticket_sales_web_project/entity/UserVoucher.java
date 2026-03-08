package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_vouchers")
public class UserVoucher {
    @Id
    @Column(name = "voucher_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Column(name = "voucher_code", nullable = false, length = 100)
    private String voucherCode;

    @ColumnDefault("'AVAILABLE'")
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private VoucherStatus status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

}