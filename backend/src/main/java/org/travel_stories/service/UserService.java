package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.FollowResponseDto;
import org.travel_stories.dto.UserRequestDto;
import org.travel_stories.dto.UserResponseDto;
import org.travel_stories.entity.User;
import org.travel_stories.exception.InvalidCredentialsException;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.LikedItineraryRepository;
import org.travel_stories.repository.SavedItineraryRepository;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.AuthorizationService;
import org.travel_stories.security.JwtUtil;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LikedItineraryRepository likedItineraryRepository;
    private final SavedItineraryRepository savedItineraryRepository;
    private final FollowRepository followRepository;
    private final JwtUtil jwtUtil;
    private final AuthorizationService authorizationService;
    private final PasswordValidationService passwordValidationService;
    private final PasswordEncoder passwordEncoder;


    public UserResponseDto map(User user) {

        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setUserId(user.getUserId());
        userResponseDto.setUsername(user.getUsername());
        userResponseDto.setEmail(user.getEmail());
        userResponseDto.setRole(user.getRole());
        userResponseDto.setBio(user.getBio());
        userResponseDto.setCreatedAt(user.getCreatedAt());

        userResponseDto.setFollowersCount(
                followRepository.findFollowers(user.getUserId()).size()
        );

        userResponseDto.setFollowingCount(
                followRepository.findFollowing(user.getUserId()).size()
        );

        return userResponseDto;
    }


    @Transactional
    public User createUser(
            String username,
            String email,
            String password
    ) {

        User user = new User();

        user.setUsername(username);
        user.setEmail(email);

        passwordValidationService.validate(password);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        User savedUser = userRepository.save(user);

        log.info(
                "User '{}' registered successfully",
                savedUser.getUsername()
        );

        return savedUser;
    }


    public UserResponseDto getUserById(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to fetch user: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });

        return map(user);
    }


    public UserResponseDto getUserByName(String username) {

        User user = userRepository.findByUsername(username);

        if (user == null) {

            log.warn(
                    "Failed to fetch user by username: user not found, username={}",
                    username
            );

            throw new ResourceNotFoundException(
                    "User not found."
            );
        }

        return map(user);
    }


    public List<UserResponseDto> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional
    public UserResponseDto updateUser(
            UserRequestDto userRequestDto,
            UUID userId
    ) {

        authorizationService.verifyOwnership(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to update user: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });

        if (userRequestDto.getUsername() != null) {
            user.setUsername(userRequestDto.getUsername());
        }

        if (userRequestDto.getBio() != null) {
            user.setBio(userRequestDto.getBio());
        }

        log.info(
                "User {} updated profile",
                userId
        );

        return map(user);
    }


    public User authenticate(
            String email,
            String password
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed login attempt: email not found, email={}",
                            email
                    );

                    return new InvalidCredentialsException(
                            "Invalid email or password"
                    );
                });

        try {

            if (!passwordEncoder.matches(password, user.getPassword())) {

                log.warn(
                        "Failed login attempt: invalid password, email={}",
                        email
                );

                throw new InvalidCredentialsException(
                        "Invalid email or password"
                );
            }

        } catch (IllegalArgumentException ex) {

            log.error(
                    "Stored password hash is invalid for userId={}",
                    user.getUserId()
            );

            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        log.info(
                "User '{}' authenticated successfully",
                user.getUsername()
        );

        return user;
    }


    public List<FollowResponseDto> searchUsers(String query) {

        if (query == null || query.trim().isEmpty()) {

            return List.of();
        }


        List<User> users =
                userRepository.searchUsers(query.trim());


        return users.stream()
                .map(user ->
                        new FollowResponseDto(
                                user.getUserId(),
                                user.getUsername()
                        )
                )
                .collect(Collectors.toList());
    }


    public String forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed password reset request: user not found, email={}",
                            email
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });


        String token =
                jwtUtil.generateResetToken(
                        user.getUsername()
                );


        log.info(
                "Password reset token generated for user '{}'",
                user.getUsername()
        );


        return token;
    }


    @Transactional
    public void resetPassword(
            String token,
            String newPassword
    ) {

        jwtUtil.validateResetToken(token);


        String username =
                jwtUtil.extractUsernameFromResetToken(token);


        User user =
                userRepository.findByUsername(username);


        if (user == null) {

            log.warn(
                    "Failed password reset: user not found, username={}",
                    username
            );


            throw new ResourceNotFoundException(
                    "User not found."
            );
        }


        passwordValidationService.validate(newPassword);

        if (passwordEncoder.matches(newPassword, user.getPassword())) {

            log.warn(
                    "Password reset rejected: new password matches current password, userId={}",
                    user.getUserId()
            );

            throw new InvalidOperationException(
                    "New password must be different from the current password."
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        log.info(
                "Password reset completed for user '{}'",
                user.getUsername()
        );
    }


    public boolean existsByEmail(String email) {

        return userRepository.existsByEmail(email);

    }

    @Transactional
    public void deleteUser(UUID userId) {
        authorizationService.verifyOwnership(userId);
        performUserDeletion(userId);
    }

    @Transactional
    public void deleteUserAsAdmin(UUID userId) {
        performUserDeletion(userId);
    }

    private void performUserDeletion(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to delete user: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException("User not found.");
                });

        likedItineraryRepository.deleteByUserUserId(userId);
        savedItineraryRepository.deleteByUserUserId(userId);
        followRepository.deleteByFollowerUserId(userId);
        followRepository.deleteByFollowingUserId(userId);

        userRepository.delete(user);

        log.info("User {} deleted", userId);
    }

}