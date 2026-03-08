package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.HallType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "cinema_halls")
public class CinemaHall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hall_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(name = "hall_name", nullable = false, length = 100)
    private String hallName;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'2D'")
    @Column(name = "hall_type")
    private HallType hallType;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "rows_count", nullable = false)
    private Integer rowsCount;

    @Column(name = "seats_per_row", nullable = false)
    private Integer seatsPerRow;

    @Column(name = "seat_layout")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> seatLayout;

    @Column(name = "screen_type", length = 100)
    private String screenType;

    @Column(name = "sound_system", length = 100)
    private String soundSystem;

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