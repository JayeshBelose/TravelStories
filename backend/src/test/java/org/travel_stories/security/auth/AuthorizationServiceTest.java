package org.travel_stories.security.auth;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.user.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRejectWhenAuthenticationIsNull() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> authorizationService.getAuthenticatedUser())
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Authentication required.");

        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldRejectWhenAuthenticationIsNotAuthenticated() {
        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(false);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertThatThrownBy(() -> authorizationService.getAuthenticatedUser())
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Authentication required.");

        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldReturnAuthenticatedUser() {
        String email = "user@example.com";
        User user = mock(User.class);

        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User result = authorizationService.getAuthenticatedUser();

        assertThat(result).isSameAs(user);

        verify(userRepository).findByEmail(email);
    }

    @Test
    void shouldRejectWhenAuthenticatedUserDoesNotExist() {
        String email = "missing@example.com";

        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertThatThrownBy(() -> authorizationService.getAuthenticatedUser())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Authenticated user not found.");

        verify(userRepository).findByEmail(email);
    }

    @Test
    void shouldAllowOwnershipWhenUserOwnsResource() {
        UUID userId = UUID.randomUUID();

        User user = mock(User.class);
        when(user.getUserId()).thenReturn(userId);

        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        authorizationService.verifyOwnership(userId);

        verify(user).getUserId();
        verify(userRepository).findByEmail("user@example.com");
    }

    @Test
    void shouldRejectOwnershipWhenUserDoesNotOwnResource() {
        UUID authenticatedUserId = UUID.randomUUID();
        UUID ownerUserId = UUID.randomUUID();

        User user = mock(User.class);
        when(user.getUserId()).thenReturn(authenticatedUserId);

        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertThatThrownBy(() -> authorizationService.verifyOwnership(ownerUserId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You are not authorized to perform this action.");

        verify(user).getUserId();
        verify(userRepository).findByEmail("user@example.com");
    }
}