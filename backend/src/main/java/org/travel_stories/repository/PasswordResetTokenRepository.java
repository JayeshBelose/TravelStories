package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.PasswordResetToken;

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
            WHERE p.expiresAt < :now
            """)
    long deleteExpiredOtpRecords(
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            DELETE FROM PasswordResetToken p
            WHERE p.user.userId = :userId
            """)
    long deleteByUserUserId(
            @Param("userId") UUID userId
    );
}