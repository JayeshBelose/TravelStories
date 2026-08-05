package org.travel_stories.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.travel_stories.exception.InvalidOperationException;

@Service
public class PasswordValidationService {

    @Value("${security.password.min-length}")
    private int MIN_PASSWORD_LENGTH;
    @Value("${security.password.max-length}")
    private int MAX_PASSWORD_LENGTH;

    public void validate(String password) {

        if (password == null) {
            throw new InvalidOperationException("Password must not be null.");
        }

        if (password.isBlank()) {
            throw new InvalidOperationException("Password must not be blank.");
        }

        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new InvalidOperationException(
                    "Password must be at least " + MIN_PASSWORD_LENGTH + " characters long."
            );
        }

        if (password.length() > MAX_PASSWORD_LENGTH) {
            throw new InvalidOperationException(
                    "Password must not exceed " + MAX_PASSWORD_LENGTH + " characters."
            );
        }
    }
}