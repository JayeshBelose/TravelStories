package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
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
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(
            @PathVariable("userId") UUID userId) {

        UserResponseDto userResponseDto = userService.getUserById(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully",
                        userResponseDto
                )
        );
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByName(
            @PathVariable("username") String username) {

        UserResponseDto userResponseDto = userService.getUserByName(username);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully",
                        userResponseDto
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {

        List<UserResponseDto> users = userService.getAllUsers();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully",
                        users
                )
        );
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable("userId") UUID userId) {

        userService.deleteUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User deleted successfully")
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @Valid @RequestBody UserRequestDto userRequestDto,
            @PathVariable("userId") UUID userId
    ) {

        UserResponseDto userResponseDto =
                userService.updateUser(userRequestDto, userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User updated successfully",
                        userResponseDto
                )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FollowResponseDto>>> searchUsers(
            @RequestParam String query) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully",
                        userService.searchUsers(query)
                )
        );
    }

}
