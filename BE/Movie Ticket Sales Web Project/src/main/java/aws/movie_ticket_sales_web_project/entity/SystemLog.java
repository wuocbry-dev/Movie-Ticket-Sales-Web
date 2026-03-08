package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.LogLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "system_logs")
public class SystemLog {
    @Id
    @Column(name = "log_id", nullable = false)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "log_level", nullable = false)
    private LogLevel logLevel;

    @Column(name = "component", length = 100)
    private String component;

    @Column(name = "action")
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Lob
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Lob
    @Column(name = "exception_details", columnDefinition = "TEXT")
    private String exceptionDetails;

    @Column(name = "request_data")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> requestData;

    @Column(name = "response_data")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> responseData;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

}