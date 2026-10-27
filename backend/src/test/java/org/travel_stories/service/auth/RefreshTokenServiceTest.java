package org.travel_stories.service.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.travel_stories.entity.token.RefreshToken;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.auth.InvalidTokenException;
import org.travel_stories.repository.token.RefreshTokenRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService service;

    private User user;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(refreshTokenRepository);

        ReflectionTestUtils.setField(
                service,
                "refreshTokenDuration",
                3600000L
        );

        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setUsername("testuser");
    }

    @Test
    void shouldCreateRefreshToken() {

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken result = service.createRefreshToken(user);

        assertThat(result).isNotNull();
        assertThat(result.getUser()).isSameAs(user);
        assertThat(result.getToken()).isNotBlank();
        assertThat(result.isRevoked()).isFalse();
        assertThat(result.getExpiryDate()).isAfter(Instant.now());

        verify(refreshTokenRepository).save(result);
    }

    @Test
    void shouldValidateValidRefreshToken() {

        RefreshToken token = createToken(
                "valid-token",
                false,
                Instant.now().plusSeconds(3600)
        );

        when(refreshTokenRepository.findByToken("valid-token"))
                .thenReturn(Optional.of(token));

        RefreshToken result =
                service.validateRefreshToken("valid-token");

        assertThat(result).isSameAs(token);

        verify(refreshTokenRepository)
                .findByToken("valid-token");
    }

    @Test
    void shouldRejectNonexistentRefreshToken() {

        when(refreshTokenRepository.findByToken("invalid-token"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> service.validateRefreshToken("invalid-token")
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token.");

        verify(refreshTokenRepository)
                .findByToken("invalid-token");
    }

    @Test
    void shouldRejectRevokedRefreshToken() {

        RefreshToken token = createToken(
                "revoked-token",
                true,
                Instant.now().plusSeconds(3600)
        );

        when(refreshTokenRepository.findByToken("revoked-token"))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(
                () -> service.validateRefreshToken("revoked-token")
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Refresh token has been revoked.");
    }

    @Test
    void shouldRejectExpiredRefreshToken() {

        RefreshToken token = createToken(
                "expired-token",
                false,
                Instant.now().minusSeconds(60)
        );

        when(refreshTokenRepository.findByToken("expired-token"))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(
                () -> service.validateRefreshToken("expired-token")
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Refresh token has expired.");
    }

    @Test
    void shouldRevokeExistingRefreshToken() {

        RefreshToken token = createToken(
                "token-to-revoke",
                false,
                Instant.now().plusSeconds(3600)
        );

        when(refreshTokenRepository.findByToken("token-to-revoke"))
                .thenReturn(Optional.of(token));

        service.revokeRefreshToken("token-to-revoke");

        assertThat(token.isRevoked()).isTrue();

        verify(refreshTokenRepository)
                .findByToken("token-to-revoke");
    }

    @Test
    void shouldDoNothingWhenRevokingNonexistentRefreshToken() {

        when(refreshTokenRepository.findByToken("missing-token"))
                .thenReturn(Optional.empty());

        assertThatCode(
                () -> service.revokeRefreshToken("missing-token")
        ).doesNotThrowAnyException();

        verify(refreshTokenRepository)
                .findByToken("missing-token");
    }

    @Test
    void shouldDeleteExpiredTokens() {

        when(refreshTokenRepository.deleteByExpiryDateBefore(any(Instant.class)))
                .thenReturn(3L);

        service.deleteExpiredTokens();

        verify(refreshTokenRepository)
                .deleteByExpiryDateBefore(any(Instant.class));
    }

    @Test
    void shouldRotateRefreshToken() {

        RefreshToken oldToken = createToken(
                "old-token",
                false,
                Instant.now().plusSeconds(3600)
        );

        RefreshToken newToken = createToken(
                "new-token",
                false,
                Instant.now().plusSeconds(7200)
        );

        when(refreshTokenRepository.findByToken("old-token"))
                .thenReturn(Optional.of(oldToken));

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenReturn(newToken);

        RefreshToken result =
                service.rotateRefreshToken("old-token");

        assertThat(oldToken.isRevoked()).isTrue();
        assertThat(result).isSameAs(newToken);

        verify(refreshTokenRepository)
                .findByToken("old-token");

        verify(refreshTokenRepository)
                .save(any(RefreshToken.class));
    }

    @Test
    void shouldDeleteRefreshTokensByUserId() {

        UUID userId = UUID.randomUUID();

        when(refreshTokenRepository.deleteByUserUserId(userId))
                .thenReturn(2);

        service.deleteRefreshTokenByUserId(userId);

        verify(refreshTokenRepository)
                .deleteByUserUserId(userId);
    }

    @Test
    void shouldRejectDeletingRefreshTokensWhenNoneExist() {

        UUID userId = UUID.randomUUID();

        when(refreshTokenRepository.deleteByUserUserId(userId))
                .thenReturn(0);

        assertThatThrownBy(
                () -> service.deleteRefreshTokenByUserId(userId)
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token.");
    }

    @Test
    void shouldLogoutAndRevokeRefreshToken() {

        RefreshToken token = createToken(
                "logout-token",
                false,
                Instant.now().plusSeconds(3600)
        );

        when(refreshTokenRepository.findByToken("logout-token"))
                .thenReturn(Optional.of(token));

        service.logout("logout-token");

        assertThat(token.isRevoked()).isTrue();

        verify(refreshTokenRepository)
                .findByToken("logout-token");
    }

    @Test
    void shouldRejectLogoutWithUnknownToken() {

        when(refreshTokenRepository.findByToken("unknown-token"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> service.logout("unknown-token")
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token.");
    }

    @Test
    void shouldDeleteAllRefreshTokensByUserId() {

        UUID userId = UUID.randomUUID();

        when(refreshTokenRepository.deleteByUserUserId(userId))
                .thenReturn(4);

        long result =
                service.deleteAllRefreshTokensByUserId(userId);

        assertThat(result).isEqualTo(4);

        verify(refreshTokenRepository)
                .deleteByUserUserId(userId);
    }

    private RefreshToken createToken(
            String tokenValue,
            boolean revoked,
            Instant expiryDate
    ) {
        RefreshToken token = new RefreshToken();

        token.setToken(tokenValue);
        token.setUser(user);
        token.setRevoked(revoked);
        token.setExpiryDate(expiryDate);

        return token;
    }
}