package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.RefreshToken;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserUserId(UUID userId);

    @Modifying
    @Query("""
        DELETE FROM RefreshToken r
        WHERE r.user.userId = :userId
        """)
    int deleteByUserUserId(@Param("userId") UUID userId);

    @Modifying
    @Transactional
    long deleteByExpiryDateBefore(Instant instant);

}