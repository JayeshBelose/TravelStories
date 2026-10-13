package org.travel_stories.controller;

import jakarta.servlet.http.HttpServletRequest;
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
import org.travel_stories.security.ratelimit.BucketKey;
import org.travel_stories.security.ratelimit.EndpointCategory;
import org.travel_stories.service.PasswordResetService;
import org.travel_stories.service.RateLimitingService;
import org.travel_stories.service.RefreshTokenService;
import org.travel_stories.service.UserService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private static final CacheControl NO_STORE =
            CacheControl.noStore();
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final RateLimitingService rateLimitingService;

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
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestParam String email,
            HttpServletRequest request
    ) {
        rateLimitingService.validateRateLimit(
                new BucketKey(
                        request.getRemoteAddr(),
                        EndpointCategory.FORGOT_PASSWORD
                )
        );

        passwordResetService.requestPasswordReset(email);

        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success(
                                "If an account exists for this email, " +
                                        "a password reset OTP has been sent."
                        )
                );
    }

    @PostMapping("/verifyResetOtp")
    public ResponseEntity<ApiResponse<String>> verifyResetOtp(
            @RequestParam String email,
            @RequestParam String otp,
            HttpServletRequest request
    ) {
        rateLimitingService.validateRateLimit(
                new BucketKey(
                        request.getRemoteAddr(),
                        EndpointCategory.VERIFY_RESET_OTP
                )
        );

        String resetToken = passwordResetService.verifyOtp(email, otp);

        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success(
                                "OTP verified successfully.",
                                resetToken
                        )
                );
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String resetToken,
            @RequestParam String newPassword,
            HttpServletRequest request
    ) {
        rateLimitingService.validateRateLimit(
                new BucketKey(
                        request.getRemoteAddr(),
                        EndpointCategory.RESET_PASSWORD
                )
        );

        passwordResetService.resetPassword(resetToken, newPassword);

        return ResponseEntity.ok()
                .cacheControl(NO_STORE)
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(
                        ApiResponse.success(
                                "Password reset successfully."
                        )
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
