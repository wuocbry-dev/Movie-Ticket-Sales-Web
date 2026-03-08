package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.NotificationType;
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
@Table(name = "notifications")
public class Notification {
    @Id
    @Column(name = "notification_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'INFO'")
    @Lob
    @Column(name = "notification_type")
    private NotificationType notificationType;

    @Column(name = "channels")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> channels;

    @Column(name = "template_id", length = 100)
    private String templateId;

    @Column(name = "template_data")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> templateData;

    @ColumnDefault("0")
    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "read_at")
    private Instant readAt;

    @ColumnDefault("0")
    @Column(name = "email_sent")
    private Boolean emailSent;

    @ColumnDefault("0")
    @Column(name = "sms_sent")
    private Boolean smsSent;

    @ColumnDefault("0")
    @Column(name = "push_sent")
    private Boolean pushSent;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

}