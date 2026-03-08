package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.converter.FormatTypeConverter;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import aws.movie_ticket_sales_web_project.enums.ShowtimeStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "showtimes")
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "showtime_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    private CinemaHall hall;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @ColumnDefault("'2D'")
    @Convert(converter = FormatTypeConverter.class)
    @Column(name = "format_type")
    private FormatType formatType;

    @Column(name = "subtitle_language", length = 50)
    private String subtitleLanguage;

    @ColumnDefault("'SCHEDULED'")
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ShowtimeStatus status;

    @Column(name = "available_seats")
    private Integer availableSeats;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}