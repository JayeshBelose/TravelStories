package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
                                    "Refresh token not found."
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

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {

            log.warn(
                    "Expired refresh token used."
            );

            throw new InvalidTokenException(
                    "Refresh token has expired."
            );
        }

        return refreshToken;
    }

    @Transactional
    public void revokeRefreshToken(String token) {

        RefreshToken refreshToken =
                validateRefreshToken(token);

        refreshToken.setRevoked(true);

        log.info(
                "Refresh token revoked for user {}",
                refreshToken.getUser().getUserId()
        );
    }

    @Transactional
    public void deleteExpiredTokens() {

        refreshTokenRepository.deleteByExpiryDateBefore(
                Instant.now()
        );

        log.info(
                "Expired refresh tokens removed."
        );
    }

    private String generateSecureToken() {

        byte[] randomBytes = new byte[64];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

}