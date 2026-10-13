package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "password_reset_tokens",
        indexes = {
                @Index(
                        name = "idx_password_reset_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_password_reset_expiry",
                        columnList = "expires_at"
                ),
                @Index(
                        name = "idx_password_reset_token_hash",
                        columnList = "reset_token_hash"
                )
        }
)
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    /**
     * SHA-256 hash of the OTP.
     *
     * Never store the plaintext OTP.
     */
    @Column(
            name = "otp_hash",
            nullable = false,
            length = 64
    )
    private String otpHash;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "attempt_count",
            nullable = false
    )
    private int attemptCount = 0;

    /**
     * Becomes true after the OTP has been successfully verified.
     */
    @Column(
            name = "verified",
            nullable = false
    )
    private boolean verified = false;

    /**
     * SHA-256 hash of the temporary password-reset authorization token.
     *
     * The plaintext token is returned only after successful OTP
     * verification.
     */
    @Column(
            name = "reset_token_hash",
            length = 64
    )
    private String resetTokenHash;

    @Column(
            name = "reset_token_expires_at"
    )
    private Instant resetTokenExpiresAt;

    /**
     * Prevents reset-token reuse.
     */
    @Column(
            name = "used",
            nullable = false
    )
    private boolean used = false;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}