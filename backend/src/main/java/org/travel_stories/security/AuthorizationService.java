package org.travel_stories.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user.
     */
    public User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required.");
        }

        String email = (String) authentication.getPrincipal();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Authenticated user not found."));
    }

    /**
     * Ensures that the authenticated user owns the resource.
     */
    public void verifyOwnership(UUID ownerUserId) {

        User authenticatedUser = getAuthenticatedUser();

        if (!authenticatedUser.getUserId().equals(ownerUserId)) {
            throw new AccessDeniedException(
                    "You are not authorized to perform this action."
            );
        }
    }
}