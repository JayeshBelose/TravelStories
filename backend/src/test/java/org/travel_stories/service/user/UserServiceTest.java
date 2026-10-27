package org.travel_stories.service.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.travel_stories.dto.user.request.UserRequestDto;
import org.travel_stories.dto.user.response.UserResponseDto;
import org.travel_stories.entity.itinerary.Image;
import org.travel_stories.entity.itinerary.Itinerary;
import org.travel_stories.entity.itinerary.Thumbnail;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.auth.InvalidCredentialsException;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.ImageRepository;
import org.travel_stories.repository.itinerary.LikedItineraryRepository;
import org.travel_stories.repository.itinerary.SavedItineraryRepository;
import org.travel_stories.repository.itinerary.ThumbnailRepository;
import org.travel_stories.repository.token.PasswordResetTokenRepository;
import org.travel_stories.repository.user.FollowRepository;
import org.travel_stories.repository.user.ProfilePictureRepository;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.security.auth.AuthorizationService;
import org.travel_stories.security.jwt.JwtUtil;
import org.travel_stories.service.auth.PasswordValidationService;
import org.travel_stories.service.auth.RefreshTokenService;
import org.travel_stories.service.storage.StorageService;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LikedItineraryRepository likedItineraryRepository;

    @Mock
    private SavedItineraryRepository savedItineraryRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private PasswordValidationService passwordValidationService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ThumbnailRepository thumbnailRepository;

    @Mock
    private ProfilePictureRepository profilePictureRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = mock(User.class);
    }

    @Test
    void shouldMapUserToResponseDto() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");
        when(user.getBio()).thenReturn("Travel enthusiast");

        UserResponseDto result = userService.map(user);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getBio()).isEqualTo("Travel enthusiast");

        verify(followRepository).countFollowers(userId);
        verify(followRepository).countFollowing(userId);
    }

    @Test
    void shouldReturnEmptyListWhenMappingEmptyUsers() {
        List<UserResponseDto> result = userService.mapUsers(List.of());

        assertThat(result).isEmpty();

        verifyNoInteractions(followRepository);
    }

    @Test
    void shouldMapUsersWithFollowerAndFollowingCounts() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");

        User secondUser = mock(User.class);
        UUID secondUserId = UUID.randomUUID();

        when(secondUser.getUserId()).thenReturn(secondUserId);
        when(secondUser.getUsername()).thenReturn("seconduser");
        when(secondUser.getEmail()).thenReturn("second@example.com");

        List<Object[]> followerCounts = List.of(
                new Object[]{userId, 10L},
                new Object[]{secondUserId, 5L}
        );

        List<Object[]> followingCounts = List.of(
                new Object[]{userId, 3L},
                new Object[]{secondUserId, 8L}
        );

        when(followRepository.countFollowersByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        )).thenReturn(followerCounts);

        when(followRepository.countFollowingByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        )).thenReturn(followingCounts);

        List<UserResponseDto> result =
                userService.mapUsers(List.of(user, secondUser));

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getUserId()).isEqualTo(userId);
        assertThat(result.get(0).getFollowersCount()).isEqualTo(10L);
        assertThat(result.get(0).getFollowingCount()).isEqualTo(3L);

        assertThat(result.get(1).getUserId()).isEqualTo(secondUserId);
        assertThat(result.get(1).getFollowersCount()).isEqualTo(5L);
        assertThat(result.get(1).getFollowingCount()).isEqualTo(8L);

        verify(followRepository).countFollowersByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        );

        verify(followRepository).countFollowingByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        );
    }

    @Test
    void shouldCreateUserSuccessfully() {
        String username = "newuser";
        String email = "new@example.com";
        String password = "Password@123";
        String encodedPassword = "encoded-password";

        when(passwordEncoder.encode(password))
                .thenReturn(encodedPassword);

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User result =
                userService.createUser(username, email, password);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo(username);
        assertThat(result.getEmail()).isEqualTo(email);
        assertThat(result.getPassword()).isEqualTo(encodedPassword);

        verify(passwordValidationService).validate(password);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldPropagatePasswordValidationFailureDuringUserCreation() {
        String password = "weak";

        doThrow(new IllegalArgumentException("Invalid password"))
                .when(passwordValidationService)
                .validate(password);

        assertThatThrownBy(() ->
                userService.createUser(
                        "testuser",
                        "test@example.com",
                        password
                ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid password");

        verify(passwordValidationService).validate(password);
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldGetUserById() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(followRepository.countFollowers(userId))
                .thenReturn(10L);

        when(followRepository.countFollowing(userId))
                .thenReturn(5L);

        UserResponseDto result =
                userService.getUserById(userId);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("testuser");

        verify(userRepository).findById(userId);
        verify(followRepository).countFollowers(userId);
        verify(followRepository).countFollowing(userId);
    }

    @Test
    void shouldRejectGetUserByIdWhenUserDoesNotExist() {
        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.getUserById(userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(userRepository).findById(userId);
        verifyNoInteractions(followRepository);
    }

    @Test
    void shouldGetUserByName() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");

        when(userRepository.findByUsername("testuser"))
                .thenReturn(user);

        when(followRepository.countFollowers(userId))
                .thenReturn(10L);

        when(followRepository.countFollowing(userId))
                .thenReturn(5L);

        UserResponseDto result =
                userService.getUserByName("testuser");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("testuser");

        verify(userRepository).findByUsername("testuser");
        verify(followRepository).countFollowers(userId);
        verify(followRepository).countFollowing(userId);
    }

    @Test
    void shouldRejectGetUserByNameWhenUserDoesNotExist() {
        when(userRepository.findByUsername("missing"))
                .thenReturn(null);

        assertThatThrownBy(() ->
                userService.getUserByName("missing"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(userRepository).findByUsername("missing");
    }

    @Test
    void shouldGetAllUsers() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");

        when(userRepository.findAll())
                .thenReturn(List.of(user));

        List<Object[]> followerCounts = Collections.singletonList(
                new Object[]{userId, 4L}
        );

        List<Object[]> followingCounts = Collections.singletonList(
                new Object[]{userId, 2L}
        );

        when(followRepository.countFollowersByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        )).thenReturn(followerCounts);

        when(followRepository.countFollowingByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        )).thenReturn(followingCounts);

        List<UserResponseDto> result =
                userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(userId);
        assertThat(result.get(0).getFollowersCount()).isEqualTo(4L);
        assertThat(result.get(0).getFollowingCount()).isEqualTo(2L);

        verify(userRepository).findAll();

        verify(followRepository).countFollowersByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        );

        verify(followRepository).countFollowingByUserIds(
                ArgumentMatchers.<List<UUID>>any()
        );
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        UserRequestDto request = new UserRequestDto();
        request.setUsername("updatedUser");
        request.setBio("Updated bio");

        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");
        when(user.getEmail()).thenReturn("test@example.com");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(followRepository.countFollowers(userId))
                .thenReturn(10L);

        when(followRepository.countFollowing(userId))
                .thenReturn(5L);

        UserResponseDto result =
                userService.updateUser(request, userId);

        verify(authorizationService)
                .verifyOwnership(userId);

        verify(user).setUsername("updatedUser");
        verify(user).setBio("Updated bio");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
    }

    @Test
    void shouldRejectUpdateWhenUserDoesNotExist() {
        UserRequestDto request = new UserRequestDto();
        request.setUsername("updatedUser");

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.updateUser(request, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(authorizationService)
                .verifyOwnership(userId);

        verify(userRepository).findById(userId);
    }

    @Test
    void shouldAuthenticateUserSuccessfully() {
        String email = "test@example.com";
        String password = "Password@123";

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(user));

        when(user.getPassword())
                .thenReturn("encoded-password");

        when(passwordEncoder.matches(
                password,
                "encoded-password"
        )).thenReturn(true);

        User result =
                userService.authenticate(email, password);

        assertThat(result).isSameAs(user);

        verify(userRepository).findByEmail(email);

        verify(passwordEncoder)
                .matches(password, "encoded-password");
    }

    @Test
    void shouldRejectAuthenticationWhenEmailDoesNotExist() {
        String email = "missing@example.com";

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.authenticate(
                        email,
                        "Password@123"
                ))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(userRepository).findByEmail(email);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldRejectAuthenticationWhenPasswordIsInvalid() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(user.getPassword())
                .thenReturn("encoded-password");

        when(passwordEncoder.matches(
                "WrongPassword",
                "encoded-password"
        )).thenReturn(false);

        assertThatThrownBy(() ->
                userService.authenticate(
                        "test@example.com",
                        "WrongPassword"
                ))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void shouldRejectAuthenticationWhenStoredPasswordHashIsInvalid() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(user.getPassword())
                .thenReturn("invalid-hash");

        when(passwordEncoder.matches(
                "Password@123",
                "invalid-hash"
        )).thenThrow(
                new IllegalArgumentException("Invalid hash")
        );

        assertThatThrownBy(() ->
                userService.authenticate(
                        "test@example.com",
                        "Password@123"
                ))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void shouldReturnEmptySearchResultForBlankQuery() {
        assertThat(userService.searchUsers(null))
                .isEmpty();

        assertThat(userService.searchUsers("   "))
                .isEmpty();

        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldSearchUsersWithTrimmedQueryAndLimit() {
        when(user.getUserId()).thenReturn(userId);
        when(user.getUsername()).thenReturn("testuser");

        User secondUser = mock(User.class);
        UUID secondUserId = UUID.randomUUID();

        when(secondUser.getUserId()).thenReturn(secondUserId);
        when(secondUser.getUsername()).thenReturn("seconduser");

        when(userRepository.searchUsers(
                eq("john"),
                eq(PageRequest.of(0, 20))
        )).thenReturn(List.of(user, secondUser));

        var result =
                userService.searchUsers("  john  ");

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getUserId())
                .isEqualTo(userId);

        assertThat(result.get(0).getUsername())
                .isEqualTo("testuser");

        assertThat(result.get(1).getUserId())
                .isEqualTo(secondUserId);

        assertThat(result.get(1).getUsername())
                .isEqualTo("seconduser");

        verify(userRepository).searchUsers(
                "john",
                PageRequest.of(0, 20)
        );
    }

    @Test
    void shouldGenerateForgotPasswordToken() {
        when(user.getUsername())
                .thenReturn("testuser");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(jwtUtil.generateResetToken("testuser"))
                .thenReturn("reset-token");

        String result =
                userService.forgotPassword("test@example.com");

        assertThat(result).isEqualTo("reset-token");

        verify(jwtUtil)
                .generateResetToken("testuser");
    }

    @Test
    void shouldRejectForgotPasswordForUnknownUser() {
        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.forgotPassword(
                        "missing@example.com"
                ))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verifyNoInteractions(jwtUtil);
    }

    @Test
    void shouldResetPasswordSuccessfully() {
        String token = "valid-reset-token";
        String username = "testuser";
        String newPassword = "NewPassword@123";

        when(jwtUtil.extractUsernameFromResetToken(token))
                .thenReturn(username);

        when(userRepository.findByUsername(username))
                .thenReturn(user);

        when(user.getPassword())
                .thenReturn("old-password");

        when(passwordEncoder.matches(
                newPassword,
                "old-password"
        )).thenReturn(false);

        when(passwordEncoder.encode(newPassword))
                .thenReturn("new-encoded-password");

        userService.resetPassword(
                token,
                newPassword
        );

        verify(jwtUtil).validateResetToken(token);

        verify(jwtUtil)
                .extractUsernameFromResetToken(token);

        verify(passwordValidationService)
                .validate(newPassword);

        verify(passwordEncoder)
                .matches(
                        newPassword,
                        "old-password"
                );

        verify(passwordEncoder)
                .encode(newPassword);

        verify(user)
                .setPassword("new-encoded-password");
    }

    @Test
    void shouldRejectResetPasswordWhenUserDoesNotExist() {
        String token = "valid-reset-token";

        when(jwtUtil.extractUsernameFromResetToken(token))
                .thenReturn("missing");

        when(userRepository.findByUsername("missing"))
                .thenReturn(null);

        assertThatThrownBy(() ->
                userService.resetPassword(
                        token,
                        "NewPassword@123"
                ))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(passwordValidationService, never())
                .validate(anyString());
    }

    @Test
    void shouldRejectResetPasswordWhenNewPasswordMatchesCurrentPassword() {
        String token = "valid-reset-token";
        String newPassword = "SamePassword@123";

        when(jwtUtil.extractUsernameFromResetToken(token))
                .thenReturn("testuser");

        when(userRepository.findByUsername("testuser"))
                .thenReturn(user);

        when(user.getPassword())
                .thenReturn("encoded-password");

        when(passwordEncoder.matches(
                newPassword,
                "encoded-password"
        )).thenReturn(true);

        assertThatThrownBy(() ->
                userService.resetPassword(
                        token,
                        newPassword
                ))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "New password must be different from the current password."
                );

        verify(passwordValidationService)
                .validate(newPassword);

        verify(passwordEncoder, never())
                .encode(newPassword);

        verify(user, never())
                .setPassword(anyString());
    }

    @Test
    void shouldCheckEmailExistence() {
        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(true);

        assertThat(
                userService.existsByEmail("test@example.com")
        ).isTrue();

        verify(userRepository)
                .existsByEmail("test@example.com");
    }

    @Test
    void shouldCheckUsernameExistence() {
        when(userRepository.existsByUsername("testuser"))
                .thenReturn(true);

        assertThat(
                userService.existsByUsername("testuser")
        ).isTrue();

        verify(userRepository)
                .existsByUsername("testuser");
    }

    @Test
    void shouldDeleteUserAfterOwnershipVerification() {
        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(user.getItineraries())
                .thenReturn(List.of());

        userService.deleteUser(userId);

        verify(authorizationService)
                .verifyOwnership(userId);

        verify(refreshTokenService)
                .deleteRefreshTokenByUserId(userId);

        verify(passwordResetTokenRepository)
                .deleteByUserUserId(userId);

        verify(userRepository)
                .delete(user);
    }

    @Test
    void shouldDeleteUserAsAdminWithoutOwnershipVerification() {
        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(user.getItineraries())
                .thenReturn(List.of());

        userService.deleteUserAsAdmin(userId);

        verify(authorizationService, never())
                .verifyOwnership(userId);

        verify(userRepository)
                .delete(user);
    }

    @Test
    void shouldRejectDeletionWhenUserDoesNotExist() {
        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.deleteUserAsAdmin(userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(userRepository)
                .findById(userId);

        verify(userRepository, never())
                .delete(any(User.class));
    }

    @Test
    void shouldDeleteStoredFilesWhenDeletingUser() {
        var profilePicture = mock(
                org.travel_stories.entity.user.ProfilePicture.class
        );

        when(user.getUserId())
                .thenReturn(userId);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(user.getItineraries())
                .thenReturn(List.of());

        when(profilePictureRepository.findByUserUserId(userId))
                .thenReturn(Optional.of(profilePicture));

        when(profilePicture.getFilePath())
                .thenReturn("profile/image.jpg");

        userService.deleteUserAsAdmin(userId);

        verify(storageService)
                .delete("profile/image.jpg");

        verify(userRepository)
                .delete(user);
    }

    @Test
    void shouldDeleteItineraryImagesAndThumbnailFiles() {
        UUID itineraryId = UUID.randomUUID();

        Itinerary itinerary = mock(Itinerary.class);
        Image image = mock(Image.class);
        Thumbnail thumbnail = mock(Thumbnail.class);

        when(user.getUserId())
                .thenReturn(userId);

        when(itinerary.getItineraryId())
                .thenReturn(itineraryId);

        when(user.getItineraries())
                .thenReturn(List.of(itinerary));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(imageRepository.findByItineraryId(itineraryId))
                .thenReturn(List.of(image));

        when(image.getFilePath())
                .thenReturn("images/photo.jpg");

        when(thumbnailRepository
                .findByItineraryItineraryId(itineraryId))
                .thenReturn(Optional.of(thumbnail));

        when(thumbnail.getFilePath())
                .thenReturn("thumbnails/thumb.jpg");

        userService.deleteUserAsAdmin(userId);

        verify(storageService)
                .delete("images/photo.jpg");

        verify(storageService)
                .delete("thumbnails/thumb.jpg");

        verify(thumbnailRepository)
                .deleteByItineraryItineraryId(itineraryId);

        verify(userRepository)
                .delete(user);
    }
}