package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.*;
import org.travel_stories.entity.RefreshToken;
import org.travel_stories.entity.User;
import org.travel_stories.security.JwtUtil;
import org.travel_stories.service.RefreshTokenService;
import org.travel_stories.service.UserService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    private static final CacheControl NO_STORE =
            CacheControl.noStore();

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokenResponseDto>> login(
            @Valid @RequestBody LoginDto loginDto) {

        User user = userService.authenticate(loginDto.getEmail(), loginDto.getPassword());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        }

        String accessToken =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()
                );


        String refreshToken =
                refreshTokenService
                        .createRefreshToken(user)
                        .getToken();

        AuthResponseDto authResponseDto =
                new AuthResponseDto(
                        user.getUserId(),
                        user.getUsername(),
                        user.getRole()
                );


        AuthTokenResponseDto response =
                new AuthTokenResponseDto(
                        accessToken,
                        refreshToken,
                        jwtUtil.getExpiration(),
                        authResponseDto
                );

        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success("Login successful", response)
                );
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthTokenResponseDto>> signup(
            @Valid @RequestBody SignupDto signupDto) {

        if (userService.existsByEmail(signupDto.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email already in use."));
        }

        User user = userService.createUser(
                signupDto.getUsername(),
                signupDto.getEmail(),
                signupDto.getPassword()
        );

        String accessToken =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()
                );


        String refreshToken =
                refreshTokenService
                        .createRefreshToken(user)
                        .getToken();

        AuthResponseDto authResponseDto =
                new AuthResponseDto(
                        user.getUserId(),
                        user.getUsername(),
                        user.getRole()
                );

        AuthTokenResponseDto response =
                new AuthTokenResponseDto(
                        accessToken,
                        refreshToken,
                        jwtUtil.getExpiration(),
                        authResponseDto
                );


        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success("User registered successfully", response)
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody LogoutRequestDto request
    ) {

        refreshTokenService.logout(
                request.getRefreshToken()
        );


        return ResponseEntity.ok(
                ApiResponse.success(
                        "Logged out successfully"
                )
        );
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @RequestParam String email) {

        String token = userService.forgotPassword(email);

        Map<String, String> response = Map.of(
                "token", token
        );

        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
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

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthTokenResponseDto>> refresh(
            @Valid @RequestBody RefreshTokenRequestDto request
    ) {


        RefreshToken newRefreshToken =
                refreshTokenService.rotateRefreshToken(
                        request.getRefreshToken()
                );


        User user =
                newRefreshToken.getUser();


        String accessToken =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        AuthResponseDto authResponseDto =
                new AuthResponseDto(
                        user.getUserId(),
                        user.getUsername(),
                        user.getRole()
                );

        AuthTokenResponseDto response =
                new AuthTokenResponseDto(
                        accessToken,
                        newRefreshToken.getToken(),
                        jwtUtil.getExpiration(),
                        authResponseDto
                );


        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success("Token refreshed successfully", response)
                );
    }

}
