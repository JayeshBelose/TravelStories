package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.UserRequestDto;
import org.travel_stories.dto.UserResponseDto;
import org.travel_stories.entity.User;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public UserResponseDto map(User user){
        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setUserId(user.getUserId());
        userResponseDto.setUsername(user.getUsername());
        userResponseDto.setEmail(user.getEmail());
        userResponseDto.setProfilePicUrl(user.getProfilePicUrl());
        userResponseDto.setBio(user.getBio());
        userResponseDto.setCreatedAt(user.getCreatedAt());
        userResponseDto.setFollowersCount(followRepository.findFollowers(user.getUserId()).size());
        userResponseDto.setFollowingCount(followRepository.findFollowing(user.getUserId()).size());
        userResponseDto.setItineraries(
                user.getItineraries().stream()
                        .map(i -> {
                            return i.getItineraryId();
                        })
                        .collect(Collectors.toList())
        );
        userResponseDto.setMemberships(
                user.getMembership().stream()
                        .map(m ->{
                            return m.getItinerary().getItineraryId();
                        })
                        .collect(Collectors.toList())
        );
        userResponseDto.setSavedItinerary(
                user.getSavedItineraries().stream()
                        .map(s -> {
                            return s.getItinerary().getItineraryId();
                        })
                        .collect(Collectors.toList())
        );

        return userResponseDto;
    }

    public UserResponseDto createUser(UserRequestDto userRequestDto){
        User user = new User();

        user.setUsername(userRequestDto.getUsername());
        user.setEmail(userRequestDto.getEmail());
        user.setPassword(userRequestDto.getPassword());
        user.setProfilePicUrl(userRequestDto.getProfilePicUrl());
        user.setBio(userRequestDto.getBio());
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        return map(user);
    }

    public UserResponseDto getUserById(UUID userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found."));

        return map(user);
    }

    public List<UserResponseDto> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public void deleteUser(UUID userId){
        userRepository.deleteById(userId);
    }

    public UserResponseDto updateUser(UserRequestDto userRequestDto, UUID userId){
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found."));

        user.setUsername(userRequestDto.getUsername());
        user.setEmail(userRequestDto.getEmail());
        user.setPassword(userRequestDto.getPassword());
        user.setProfilePicUrl(userRequestDto.getProfilePicUrl());
        user.setBio(userRequestDto.getBio());
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        return map(user);
    }

}
