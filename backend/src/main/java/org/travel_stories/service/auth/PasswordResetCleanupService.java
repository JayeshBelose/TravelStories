package org.travel_stories.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.repository.token.PasswordResetTokenRepository;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetCleanupService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void cleanupPasswordResetTokens() {

        Instant now = Instant.now();

        long expiredOtpRecords =
                passwordResetTokenRepository.deleteExpiredOtpRecords(now);

        long expiredResetTokens =
                passwordResetTokenRepository.deleteExpiredResetTokens(now);

        long usedRecords =
                passwordResetTokenRepository.deleteUsedResetTokens();

        long totalDeleted =
                expiredOtpRecords +
                        expiredResetTokens +
                        usedRecords;

        if (totalDeleted > 0) {
            log.info(
                    "Password reset cleanup completed. " +
                            "Deleted {} expired OTP records, " +
                            "{} expired reset-token records and {} used records.",
                    expiredOtpRecords,
                    expiredResetTokens,
                    usedRecords
            );
        }
    }
}