package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

/**
 * Entity để liên kết nhân viên (Staff) với rạp chiếu phim (Cinema)
 * Một staff có thể làm việc tại một rạp
 */
@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cinema_staffs", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "cinema_id"}))
public class CinemaStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_staff_id", nullable = false)
    private Integer id;

    /**
     * Nhân viên (User với role CINEMA_STAFF)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Rạp chiếu phim mà nhân viên làm việc
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    /**
     * Trạng thái hoạt động (có đang làm việc tại rạp này không)
     */
    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    /**
     * Chức vụ/vị trí của nhân viên tại rạp
     * VD: CASHIER, TICKET_CHECKER, CONCESSION, etc.
     */
    @Column(name = "position", length = 100)
    private String position;

    /**
     * Ngày bắt đầu làm việc
     */
    @Column(name = "start_date")
    private Instant startDate;

    /**
     * Ngày kết thúc (nếu đã nghỉ việc)
     */
    @Column(name = "end_date")
    private Instant endDate;

    /**
     * Người gán staff vào rạp
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    /**
     * Ghi chú
     */
    @Column(name = "notes", length = 500)
    private String notes;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (isActive == null) {
            isActive = true;
        }
        if (startDate == null) {
            startDate = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
