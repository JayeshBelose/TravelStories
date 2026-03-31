package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.*;
import org.travel_stories.service.UserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable("userId") UUID userId){
        UserResponseDto userResponseDto = userService.getUserById(userId);

        return ResponseEntity.ok().body(userResponseDto);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponseDto> getUserByName(@PathVariable("username") String username){
        UserResponseDto userResponseDto = userService.getUserByName(username);
        return ResponseEntity.ok().body(userResponseDto);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(){
        List<UserResponseDto> users = userService.getAllUsers();

        return ResponseEntity.ok().body(users);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable("userId") UUID userId){
        userService.deleteUser(userId);

        return ResponseEntity.ok("User deleted.");
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponseDto> updateUser(
            @RequestBody UserRequestDto userRequestDto,
            @PathVariable("userId") UUID userId
    ){
        UserResponseDto userResponseDto = userService.updateUser(userRequestDto, userId);

        return ResponseEntity.ok().body(userResponseDto);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FollowResponseDto>> searchUsers(
            @RequestParam String query
    ){
        return ResponseEntity.ok().body(userService.searchUsers(query));
    }

}
