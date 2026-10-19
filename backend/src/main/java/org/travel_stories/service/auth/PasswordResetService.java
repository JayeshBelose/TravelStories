package org.travel_stories.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.token.PasswordResetToken;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.auth.InvalidTokenException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.token.PasswordResetTokenRepository;
import org.travel_stories.repository.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.travel_stories.service.email.EmailService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private static final int OTP_LENGTH = 6;

    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidationService passwordValidationService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetAttemptService passwordResetAttemptService;

    @Value("${security.password-reset.otp-expiration:300000}")
    private long otpExpiration;

    @Value("${security.password-reset.reset-token-expiration:600000}")
    private long resetTokenExpiration;

    /**
     * Requests a password reset.
     *
     * The method intentionally does not reveal whether
     * the supplied email belongs to an existing account.
     */
    @Transactional
    public void requestPasswordReset(String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {

            log.info(
                    "Password reset requested for non-existing account."
            );

            return;
        }

        /*
         * Invalidate any previous reset requests.
         */
        passwordResetTokenRepository
                .deleteByUserUserId(user.getUserId());

        String otp = generateOtp();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setUser(user);
        resetToken.setOtpHash(hash(otp));
        resetToken.setExpiresAt(
                Instant.now().plusMillis(otpExpiration)
        );

        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetOtp(
                user.getEmail(),
                otp
        );

        log.info(
                "Password reset OTP generated for userId={}",
                user.getUserId()
        );
    }

    /**
     * Verifies the OTP and generates a short-lived reset token.
     */
    @Transactional
    public String verifyOtp(
            String email,
            String otp
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new InvalidTokenException(
                                "Invalid or expired OTP."
                        )
                );

        PasswordResetToken resetRequest =
                passwordResetTokenRepository
                        .findTopByUserUserIdAndUsedFalseOrderByCreatedAtDesc(
                                user.getUserId()
                        )
                        .orElseThrow(() ->
                                new InvalidTokenException(
                                        "Invalid or expired OTP."
                                )
                        );

        if (resetRequest.getExpiresAt()
                .isBefore(Instant.now())) {

            throw new InvalidTokenException(
                    "OTP has expired."
            );
        }

        if (resetRequest.isVerified()) {

            throw new InvalidOperationException(
                    "OTP has already been verified."
            );
        }

        if (resetRequest.getAttemptCount()
                >= MAX_OTP_ATTEMPTS) {

            throw new InvalidTokenException(
                    "Too many invalid OTP attempts."
            );
        }

        String suppliedOtpHash = hash(otp);

        boolean otpMatches = MessageDigest.isEqual(
                suppliedOtpHash.getBytes(StandardCharsets.UTF_8),
                resetRequest.getOtpHash()
                        .getBytes(StandardCharsets.UTF_8)
        );

        if (!otpMatches) {

            /*
             * Record the failed attempt in a separate transaction
             * so the increment is not rolled back when we throw.
             */
            int attemptCount =
                    passwordResetAttemptService
                            .recordFailedAttempt(resetRequest);

            int attemptsRemaining =
                    Math.max(0, MAX_OTP_ATTEMPTS - attemptCount);

            if (attemptsRemaining == 0) {
                throw new InvalidTokenException(
                        "Too many invalid OTP attempts. Please request a new verification code."
                );
            }

            throw new InvalidTokenException(
                    "Invalid OTP. "
                            + attemptsRemaining
                            + " attempt"
                            + (attemptsRemaining == 1 ? "" : "s")
                            + " remaining."
            );
        }

        resetRequest.setVerified(true);

        /*
         * Generate a cryptographically secure reset token.
         */
        String resetToken = generateSecureToken();

        /*
         * Only store the hash in the database.
         */
        resetRequest.setResetTokenHash(
                hash(resetToken)
        );

        resetRequest.setResetTokenExpiresAt(
                Instant.now().plusMillis(
                        resetTokenExpiration
                )
        );

        passwordResetTokenRepository.save(resetRequest);

        return resetToken;
    }

    /**
     * Resets the user's password using the short-lived
     * reset authorization token.
     */
    @Transactional
    public void resetPassword(
            String resetToken,
            String newPassword
    ) {

        if (resetToken == null ||
                resetToken.isBlank()) {

            throw new InvalidTokenException(
                    "Invalid or expired reset token."
            );
        }

        String resetTokenHash = hash(resetToken);

        PasswordResetToken resetRequest =
                passwordResetTokenRepository
                        .findByResetTokenHashAndUsedFalseForUpdate(
                                resetTokenHash
                        )
                        .orElseThrow(() ->
                                new InvalidTokenException(
                                        "Invalid or expired reset token."
                                )
                        );

        if (!resetRequest.isVerified()) {

            throw new InvalidTokenException(
                    "OTP verification required."
            );
        }

        if (resetRequest.isUsed()) {

            throw new InvalidTokenException(
                    "Invalid or expired reset token."
            );
        }

        if (resetRequest.getResetTokenExpiresAt() == null ||
                resetRequest.getResetTokenExpiresAt()
                        .isBefore(Instant.now())) {

            throw new InvalidTokenException(
                    "Invalid or expired reset token."
            );
        }

        User user = resetRequest.getUser();

        if (user == null) {

            throw new ResourceNotFoundException(
                    "User not found."
            );
        }

        /*
         * Apply the same password rules used elsewhere
         * in the application.
         */
        passwordValidationService.validate(
                newPassword
        );

        /*
         * Prevent the user from reusing the current password.
         */
        if (passwordEncoder.matches(
                newPassword,
                user.getPassword()
        )) {

            throw new InvalidOperationException(
                    "New password must be different from the current password."
            );
        }

        /*
         * Update the password.
         */
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        /*
         * Password reset invalidates ALL existing sessions.
         */
        refreshTokenService.deleteAllRefreshTokensByUserId(
                user.getUserId()
        );

        /*
         * Make the reset token permanently unusable.
         */
        resetRequest.setUsed(true);

        passwordResetTokenRepository.save(
                resetRequest
        );

        log.info(
                "Password successfully reset for userId={}",
                user.getUserId()
        );
    }

    private String generateOtp() {

        int minimum = 100000;
        int maximum = 999999;

        return String.valueOf(
                minimum +
                        SECURE_RANDOM.nextInt(
                                maximum - minimum + 1
                        )
        );
    }

    private String generateSecureToken() {

        byte[] bytes = new byte[32];

        SECURE_RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hash(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            return HexFormat.of().formatHex(
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    )
            );

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm unavailable.",
                    e
            );
        }
    }
}