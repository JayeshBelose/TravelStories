package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.LoginDto;
import org.travel_stories.dto.SignupDto;
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
        userResponseDto.setProfilePicture(user.getProfilePicture());
        userResponseDto.setBio(user.getBio());
        userResponseDto.setCreatedAt(user.getCreatedAt());
        userResponseDto.setFollowersCount(followRepository.findFollowers(user.getUserId()).size());
        userResponseDto.setFollowingCount(followRepository.findFollowing(user.getUserId()).size());

        return userResponseDto;
    }

    public UserResponseDto signup(SignupDto signupDto){
        User user = new User();

        user.setUsername(signupDto.getUsername());
        user.setEmail(signupDto.getEmail());
        user.setPassword(signupDto.getPassword());
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
        user.setProfilePicture(userRequestDto.getProfilePicture());
        user.setBio(userRequestDto.getBio());
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        return map(user);
    }

    public UserResponseDto login(LoginDto loginDto){
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!user.getPassword().equals(loginDto.getPassword())){
            throw new RuntimeException("Invalid credentials.");
        }

        return map(user);
    }

}
