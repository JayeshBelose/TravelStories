package org.travel_stories.service.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.travel_stories.entity.token.PasswordResetToken;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.auth.InvalidTokenException;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.repository.token.PasswordResetTokenRepository;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.service.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordValidationService passwordValidationService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordResetAttemptService passwordResetAttemptService;

    private PasswordResetService service;

    private User user;

    @BeforeEach
    void setUp() {

        service = new PasswordResetService(
                userRepository,
                passwordResetTokenRepository,
                emailService,
                passwordEncoder,
                passwordValidationService,
                refreshTokenService,
                passwordResetAttemptService
        );

        ReflectionTestUtils.setField(
                service,
                "otpExpiration",
                300000L
        );

        ReflectionTestUtils.setField(
                service,
                "resetTokenExpiration",
                600000L
        );

        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        user.setPassword("$2a$10$existing-password-hash");
    }

    @Test
    void shouldNotRevealWhetherEmailExists() {

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThatCode(() ->
                service.requestPasswordReset("unknown@example.com")
        ).doesNotThrowAnyException();

        verify(passwordResetTokenRepository, never())
                .save(any());

        verify(emailService, never())
                .sendPasswordResetOtp(anyString(), anyString());
    }

    @Test
    void shouldCreateAndSendPasswordResetOtp() {

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        service.requestPasswordReset(user.getEmail());

        verify(passwordResetTokenRepository)
                .deleteByUserUserId(user.getUserId());

        ArgumentCaptor<PasswordResetToken> captor =
                ArgumentCaptor.forClass(PasswordResetToken.class);

        verify(passwordResetTokenRepository)
                .save(captor.capture());

        PasswordResetToken savedToken = captor.getValue();

        assertThat(savedToken.getUser())
                .isSameAs(user);

        assertThat(savedToken.getOtpHash())
                .isNotBlank()
                .hasSize(64);

        assertThat(savedToken.getExpiresAt())
                .isAfter(Instant.now());

        ArgumentCaptor<String> otpCaptor =
                ArgumentCaptor.forClass(String.class);

        verify(emailService)
                .sendPasswordResetOtp(
                        eq(user.getEmail()),
                        otpCaptor.capture()
                );

        String otp = otpCaptor.getValue();

        assertThat(otp)
                .matches("\\d{6}");
    }

    @Test
    void shouldRejectOtpForUnknownEmail() {

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.verifyOtp(
                        "unknown@example.com",
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired OTP.");
    }

    @Test
    void shouldRejectOtpWhenNoResetRequestExists() {

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired OTP.");
    }

    @Test
    void shouldRejectExpiredOtp() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().minusSeconds(60),
                        false,
                        false
                );

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("OTP has expired.");
    }

    @Test
    void shouldRejectAlreadyVerifiedOtp() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        true,
                        false
                );

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("OTP has already been verified.");
    }

    @Test
    void shouldRejectOtpAfterMaximumAttempts() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        false,
                        false
                );

        resetToken.setAttemptCount(5);

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Too many invalid OTP attempts.");
    }

    @Test
    void shouldRejectIncorrectOtpAndRecordFailedAttempt() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        false,
                        false
                );

        /*
         * This is deliberately not the hash of 123456.
         */
        resetToken.setOtpHash(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        when(passwordResetAttemptService
                .recordFailedAttempt(resetToken))
                .thenReturn(1);

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage(
                        "Invalid OTP. 4 attempts remaining."
                );

        verify(passwordResetAttemptService)
                .recordFailedAttempt(resetToken);
    }

    @Test
    void shouldRejectIncorrectOtpWhenLastAttemptIsConsumed() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        false,
                        false
                );

        resetToken.setOtpHash(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        when(passwordResetAttemptService
                .recordFailedAttempt(resetToken))
                .thenReturn(5);

        assertThatThrownBy(() ->
                service.verifyOtp(
                        user.getEmail(),
                        "123456"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage(
                        "Too many invalid OTP attempts. Please request a new verification code."
                );
    }

    @Test
    void shouldVerifyCorrectOtpAndGenerateResetToken() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        false,
                        false
                );

        String otp = "123456";

        resetToken.setOtpHash(sha256(otp));

        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordResetTokenRepository
                .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                        user.getUserId()
                ))
                .thenReturn(Optional.of(resetToken));

        when(passwordResetTokenRepository.save(resetToken))
                .thenReturn(resetToken);

        String result =
                service.verifyOtp(
                        user.getEmail(),
                        otp
                );

        assertThat(result)
                .isNotBlank();

        assertThat(resetToken.isVerified())
                .isTrue();

        assertThat(resetToken.getResetTokenHash())
                .isNotBlank()
                .hasSize(64);

        assertThat(resetToken.getResetTokenExpiresAt())
                .isAfter(Instant.now());

        verify(passwordResetTokenRepository)
                .save(resetToken);

        verify(passwordResetAttemptService, never())
                .recordFailedAttempt(any());
    }

    @Test
    void shouldRejectNullResetToken() {

        assertThatThrownBy(() ->
                service.resetPassword(
                        null,
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired reset token.");
    }

    @Test
    void shouldRejectBlankResetToken() {

        assertThatThrownBy(() ->
                service.resetPassword(
                        "   ",
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired reset token.");
    }

    @Test
    void shouldRejectUnknownResetToken() {

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.resetPassword(
                        "unknown-reset-token",
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired reset token.");
    }

    @Test
    void shouldRejectResetTokenWhenOtpWasNotVerified() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        false,
                        false
                );

        resetToken.setVerified(false);

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.resetPassword(
                        "valid-reset-token",
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("OTP verification required.");
    }

    @Test
    void shouldRejectAlreadyUsedResetToken() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        true,
                        true
                );

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.resetPassword(
                        "valid-reset-token",
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired reset token.");
    }

    @Test
    void shouldRejectExpiredResetToken() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().minusSeconds(60),
                        true,
                        false
                );

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.resetPassword(
                        "valid-reset-token",
                        "NewPassword123"
                )
        )
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or expired reset token.");
    }

    @Test
    void shouldRejectResetWhenUserIsMissing() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        true,
                        false
                );

        resetToken.setUser(null);

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() ->
                service.resetPassword(
                        "valid-reset-token",
                        "NewPassword123"
                )
        )
                .isInstanceOf(
                        org.travel_stories.exception.resource.ResourceNotFoundException.class
                )
                .hasMessage("User not found.");
    }

    @Test
    void shouldRejectPasswordReuse() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        true,
                        false
                );

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        doNothing()
                .when(passwordValidationService)
                .validate("OldPassword123");

        when(passwordEncoder.matches(
                "OldPassword123",
                user.getPassword()
        )).thenReturn(true);

        assertThatThrownBy(() ->
                service.resetPassword(
                        "valid-reset-token",
                        "OldPassword123"
                )
        )
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "New password must be different from the current password."
                );

        verify(refreshTokenService, never())
                .deleteAllRefreshTokensByUserId(any());
    }

    @Test
    void shouldResetPasswordSuccessfully() {

        PasswordResetToken resetToken =
                createResetToken(
                        Instant.now().plusSeconds(300),
                        true,
                        false
                );

        String newPassword = "NewPassword123";
        String encodedPassword = "encoded-new-password";

        when(passwordResetTokenRepository
                .findByResetTokenHashAndUsedFalseForUpdate(anyString()))
                .thenReturn(Optional.of(resetToken));

        doNothing()
                .when(passwordValidationService)
                .validate(newPassword);

        when(passwordEncoder.matches(
                newPassword,
                user.getPassword()
        )).thenReturn(false);

        when(passwordEncoder.encode(newPassword))
                .thenReturn(encodedPassword);

        when(refreshTokenService
                .deleteAllRefreshTokensByUserId(user.getUserId()))
                .thenReturn(2L);

        service.resetPassword(
                "valid-reset-token",
                newPassword
        );

        assertThat(user.getPassword())
                .isEqualTo(encodedPassword);

        assertThat(resetToken.isUsed())
                .isTrue();

        verify(passwordValidationService)
                .validate(newPassword);

        verify(passwordEncoder)
                .encode(newPassword);

        verify(refreshTokenService)
                .deleteAllRefreshTokensByUserId(user.getUserId());

        verify(passwordResetTokenRepository)
                .save(resetToken);
    }

    private PasswordResetToken createResetToken(
            Instant expiry,
            boolean verified,
            boolean used
    ) {

        PasswordResetToken token =
                new PasswordResetToken();

        token.setUser(user);
        token.setOtpHash(sha256("123456"));
        token.setExpiresAt(expiry);
        token.setVerified(verified);
        token.setUsed(used);
        token.setAttemptCount(0);

        if (verified) {
            token.setResetTokenHash(
                    sha256("valid-reset-token")
            );

            token.setResetTokenExpiresAt(expiry);
        }

        return token;
    }

    private String sha256(String value) {

        try {

            var digest =
                    java.security.MessageDigest
                            .getInstance("SHA-256");

            return java.util.HexFormat.of()
                    .formatHex(
                            digest.digest(
                                    value.getBytes(
                                            java.nio.charset.StandardCharsets.UTF_8
                                    )
                            )
                    );

        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}