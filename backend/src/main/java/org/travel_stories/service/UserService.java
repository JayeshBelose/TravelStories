package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.travel_stories.dto.*;
import org.travel_stories.entity.User;
import org.travel_stories.exception.InvalidCredentialsException;
import org.travel_stories.exception.InvalidTokenException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.LikedItineraryRepository;
import org.travel_stories.repository.SavedItineraryRepository;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.JwtUtil;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final LikedItineraryRepository likedItineraryRepository;
    private final SavedItineraryRepository savedItineraryRepository;
    private final FollowRepository followRepository;
    private final JwtUtil jwtUtil;

    public UserResponseDto map(User user){
        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setUserId(user.getUserId());
        userResponseDto.setUsername(user.getUsername());
        userResponseDto.setEmail(user.getEmail());
        userResponseDto.setRole(user.getRole());
        userResponseDto.setBio(user.getBio());
        userResponseDto.setCreatedAt(user.getCreatedAt());
        userResponseDto.setFollowersCount(followRepository.findFollowers(user.getUserId()).size());
        userResponseDto.setFollowingCount(followRepository.findFollowing(user.getUserId()).size());

        return userResponseDto;
    }

    @Transactional
    public User createUser(
            String username,
            String email,
            String password
    ){

        User user = new User();

        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);

        User savedUser = userRepository.save(user);

        log.info(
                "User '{}' registered successfully",
                savedUser.getUsername()
        );

        return savedUser;
    }

    public UserResponseDto getUserById(UUID userId){

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

    public UserResponseDto getUserByName(String username){

        User user = userRepository.findByUsername(username);

        if(user == null){
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

    public List<UserResponseDto> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(UUID userId){

        userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to delete user: user not found, userId={}",
                            userId
                    );
                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });

        likedItineraryRepository.deleteByUserUserId(userId);

        savedItineraryRepository.deleteByUserUserId(userId);

        followRepository.deleteByFollowerUserId(userId);

        followRepository.deleteByFollowingUserId(userId);

        userRepository.deleteById(userId);

        log.info(
                "User {} deleted",
                userId
        );
    }

    @Transactional
    public UserResponseDto updateUser(
            UserRequestDto userRequestDto,
            UUID userId
    ){

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

        if(userRequestDto.getUsername()!=null){
            user.setUsername(
                    userRequestDto.getUsername()
            );
        }

        if(userRequestDto.getBio()!=null){
            user.setBio(
                    userRequestDto.getBio()
            );
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
    ){

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


        if(!user.getPassword().equals(password)){

            log.warn(
                    "Failed login attempt: invalid password, email={}",
                    email
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

    public List<FollowResponseDto> searchUsers(String query){
        if (query == null || query.trim().isEmpty()){
            return List.of();
        }

        List<User> users = userRepository.searchUsers(query.trim());

        return users.stream()
                .map(user -> {
                    return new FollowResponseDto(user.getUserId(), user.getUsername());
                })
                .collect(Collectors.toList());
    }

    public String forgotPassword(String email){

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

        String token = jwtUtil.generateResetToken(
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
    ){

        if(!jwtUtil.validateToken(token)
                || !jwtUtil.isResetToken(token)){

            log.warn(
                    "Failed password reset: invalid or expired token"
            );

            throw new InvalidTokenException(
                    "Invalid or expired token"
            );
        }

        String username =
                jwtUtil.extractUsernameFromResetToken(token);

        User user = userRepository.findByUsername(username);

        if(user == null){

            log.warn(
                    "Failed password reset: user not found, username={}",
                    username
            );

            throw new ResourceNotFoundException(
                    "User not found."
            );
        }

        user.setPassword(newPassword);

        log.info(
                "Password reset completed for user '{}'",
                user.getUsername()
        );
    }

}
