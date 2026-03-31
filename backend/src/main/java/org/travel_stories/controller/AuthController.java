package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.travel_stories.dto.AuthResponseDto;
import org.travel_stories.dto.LoginDto;
import org.travel_stories.dto.SignupDto;
import org.travel_stories.entity.User;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.JwtUtil;
import org.travel_stories.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto){
        User user = userService.authenticate(loginDto.getEmail(), loginDto.getPassword());

        if (user == null) {
            return ResponseEntity
                    .status(401)
                    .body(new AuthResponseDto(null, null, null, null, "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(
                new AuthResponseDto(
                        token,
                        user.getUserId(),
                        user.getUsername(),
                        user.getRole(),
                        null
                )
        );
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@RequestBody SignupDto signupDto){
        if (userRepository.existsByEmail(signupDto.getEmail())){
            return ResponseEntity
                    .badRequest()
                    .body(new AuthResponseDto(null, null, null, null, "Email already in use."));
        }

        User user = userService.createUser(signupDto.getUsername(), signupDto.getEmail(), signupDto.getPassword());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok().body(new AuthResponseDto(token, user.getUserId(), user.getUsername(), user.getRole(), null));
    }

}
