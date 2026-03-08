package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_sessions")
public class UserSession {
    @Id
    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Lob
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

}