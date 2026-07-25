package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.RefreshToken;
import org.travel_stories.entity.User;
import org.travel_stories.exception.InvalidTokenException;
import org.travel_stories.repository.RefreshTokenRepository;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenDuration;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public RefreshToken createRefreshToken(User user) {

        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setToken(generateSecureToken());
        refreshToken.setExpiryDate(
                Instant.now().plusMillis(refreshTokenDuration)
        );
        refreshToken.setRevoked(false);

        RefreshToken savedToken =
                refreshTokenRepository.save(refreshToken);

        log.info(
                "Refresh token created for user {}",
                user.getUserId()
        );

        return savedToken;
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {

        RefreshToken refreshToken =
                refreshTokenRepository.findByToken(token)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Invalid refresh token used."
                            );

                            return new InvalidTokenException(
                                    "Invalid refresh token."
                            );
                        });


        if (refreshToken.isRevoked()) {

            log.warn(
                    "Revoked refresh token used."
            );

            throw new InvalidTokenException(
                    "Refresh token has been revoked."
            );
        }


        if (refreshToken.getExpiryDate()
                .isBefore(Instant.now())) {


            log.warn(
                    "Expired refresh token used."
            );

            throw new InvalidTokenException(
                    "Refresh token has expired."
            );
        }


        // Force initialization while transaction is active
        refreshToken.getUser().getEmail();
        refreshToken.getUser().getRole();
        refreshToken.getUser().getUsername();


        return refreshToken;
    }

    @Transactional
    public void revokeRefreshToken(String token) {

        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {

                    refreshToken.setRevoked(true);

                    log.info(
                            "Refresh token revoked for user {}",
                            refreshToken.getUser().getUserId()
                    );

                });
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deleteExpiredTokens() {

        long deleted =
                refreshTokenRepository.deleteByExpiryDateBefore(
                        Instant.now()
                );

        if (deleted > 0) {

            log.info(
                    "Deleted {} expired refresh tokens.",
                    deleted
            );
        }
    }

    private String generateSecureToken() {

        byte[] randomBytes = new byte[64];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String oldToken) {

        RefreshToken existingToken =
                validateRefreshToken(oldToken);

        existingToken.setRevoked(true);


        RefreshToken newToken =
                createRefreshToken(existingToken.getUser());


        log.info(
                "Refresh token rotated for user {}",
                existingToken.getUser().getUserId()
        );


        return newToken;
    }

    @Transactional
    public void logout(String token) {

        RefreshToken refreshToken =
                refreshTokenRepository.findByToken(token)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Logout failed. Refresh token not found."
                            );

                            return new InvalidTokenException(
                                    "Invalid refresh token."
                            );
                        });


        refreshToken.setRevoked(true);


        log.info(
                "Refresh token revoked during logout for user {}",
                refreshToken.getUser().getUserId()
        );
    }

}