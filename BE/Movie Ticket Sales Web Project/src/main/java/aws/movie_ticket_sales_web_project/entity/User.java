package aws.movie_ticket_sales_web_project.entity;

import aws.movie_ticket_sales_web_project.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;


    @Column(name = "email")
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("0")
    @Column(name = "is_email_verified")
    private Boolean isEmailVerified;

    @ColumnDefault("0")
    @Column(name = "is_phone_verified")
    private Boolean isPhoneVerified;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "phone_verified_at")
    private Instant phoneVerifiedAt;

    @ColumnDefault("0")
    @Column(name = "privacy_policy_accepted")
    private Boolean privacyPolicyAccepted;

    @Column(name = "privacy_policy_version", length = 20)
    private String privacyPolicyVersion;

    @Column(name = "privacy_policy_accepted_at")
    private Instant privacyPolicyAcceptedAt;

    @ColumnDefault("0")
    @Column(name = "terms_of_service_accepted")
    private Boolean termsOfServiceAccepted;

    @Column(name = "terms_of_service_version", length = 20)
    private String termsOfServiceVersion;

    @Column(name = "terms_of_service_accepted_at")
    private Instant termsOfServiceAcceptedAt;

    @ColumnDefault("0")
    @Column(name = "marketing_email_consent")
    private Boolean marketingEmailConsent;

    @ColumnDefault("0")
    @Column(name = "marketing_sms_consent")
    private Boolean marketingSmsConsent;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @ColumnDefault("0")
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private Instant passwordResetExpires;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

}