package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.PasswordResetToken;
import org.travel_stories.repository.PasswordResetTokenRepository;

@Service
@RequiredArgsConstructor
public class PasswordResetAttemptService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedAttempt(
            PasswordResetToken resetRequest
    ) {

        resetRequest.setAttemptCount(
                resetRequest.getAttemptCount() + 1
        );

        passwordResetTokenRepository.save(
                resetRequest
        );
    }
}