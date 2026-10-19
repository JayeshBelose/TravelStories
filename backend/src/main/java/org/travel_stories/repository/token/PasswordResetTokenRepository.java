package org.travel_stories.repository.token;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.travel_stories.entity.token.PasswordResetToken;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken>
    findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
            UUID userId
    );

    Optional<PasswordResetToken>
    findByResetTokenHashAndUsedFalse(
            String resetTokenHash
    );

    @Modifying
    @Query("""
    DELETE FROM PasswordResetToken p
    WHERE p.verified = false
      AND p.expiresAt < :now
""")
    long deleteExpiredOtpRecords(@Param("now") Instant now);

    @Modifying
    @Query("""
    DELETE FROM PasswordResetToken p
    WHERE p.verified = true
      AND p.resetTokenExpiresAt < :now
""")
    long deleteExpiredResetTokens(@Param("now") Instant now);

    @Modifying
    @Query("""
    DELETE FROM PasswordResetToken p
    WHERE p.used = true
""")
    long deleteUsedResetTokens();

    @Modifying
    @Query("""
            DELETE FROM PasswordResetToken p
            WHERE p.user.userId = :userId
            """)
    long deleteByUserUserId(
            @Param("userId") UUID userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT p
        FROM PasswordResetToken p
        WHERE p.resetTokenHash = :resetTokenHash
          AND p.used = false
        """)
    Optional<PasswordResetToken> findByResetTokenHashAndUsedFalseForUpdate(
            @Param("resetTokenHash") String resetTokenHash
    );

}