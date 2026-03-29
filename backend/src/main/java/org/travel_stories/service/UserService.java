package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.travel_stories.dto.*;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.entity.User;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.LikedItineraryRepository;
import org.travel_stories.repository.SavedItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final LikedItineraryRepository likedItineraryRepository;
    private final SavedItineraryRepository savedItineraryRepository;
    private final FollowRepository followRepository;

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

    public User createUser(String username, String email, String password){
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);

        userRepository.save(user);
        return user;
    }

    public UserResponseDto getUserById(UUID userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found."));

        return map(user);
    }

    public UserResponseDto getUserByName(String username){
        User user = userRepository.findByUsername(username);
        return map(user);
    }

    public List<UserResponseDto> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public void deleteUser(UUID userId){
        likedItineraryRepository.deleteByUserUserId(userId);
        savedItineraryRepository.deleteByUserUserId(userId);
        followRepository.deleteByFollowerUserId(userId);
        followRepository.deleteByFollowingUserId(userId);
        userRepository.deleteById(userId);
    }

    public UserResponseDto updateUser(
            UserRequestDto userRequestDto,
            UUID userId
    ){
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found."));

        user.setUsername(userRequestDto.getUsername());
        user.setBio(userRequestDto.getBio());
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        return map(user);
    }

    public User authenticate(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")
                );

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

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

}
