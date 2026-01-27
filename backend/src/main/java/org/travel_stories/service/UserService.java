package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.travel_stories.dto.UserRequestDto;
import org.travel_stories.dto.UserResponseDto;
import org.travel_stories.entity.User;
import org.travel_stories.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDto map(User user){
        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setUserId(user.getUserId());
        userResponseDto.setUsername(user.getUsername());
        userResponseDto.setEmail(user.getEmail());
        userResponseDto.setProfilePicUrl(user.getProfilePicUrl());
        userResponseDto.setBio(user.getBio());
        userResponseDto.setCreatedAt(user.getCreatedAt());

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

}
