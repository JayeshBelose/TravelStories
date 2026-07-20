package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.AuthResponseDto;
import org.travel_stories.dto.LoginDto;
import org.travel_stories.dto.SignupDto;
import org.travel_stories.entity.User;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.JwtUtil;
import org.travel_stories.service.UserService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@RequestBody LoginDto loginDto) {

        User user = userService.authenticate(loginDto.getEmail(), loginDto.getPassword());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        AuthResponseDto response = new AuthResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole(),
                null
        );

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponseDto>> signup(@RequestBody SignupDto signupDto) {

        if (userRepository.existsByEmail(signupDto.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email already in use."));
        }

        User user = userService.createUser(
                signupDto.getUsername(),
                signupDto.getEmail(),
                signupDto.getPassword()
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        AuthResponseDto response = new AuthResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole(),
                null
        );

        return ResponseEntity.ok(
                ApiResponse.success("User registered successfully", response)
        );
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @RequestParam String email) {

        String token = userService.forgotPassword(email);

        Map<String, String> response = Map.of(
                "token", token
        );

        return ResponseEntity.ok(
                ApiResponse.success("Use this token to reset password", response)
        );
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        userService.resetPassword(token, newPassword);

        return ResponseEntity.ok(
                ApiResponse.success("Password updated successfully")
        );
    }

}
