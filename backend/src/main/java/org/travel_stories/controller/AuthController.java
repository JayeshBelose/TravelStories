package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.travel_stories.dto.AuthResponseDto;
import org.travel_stories.dto.LoginDto;
import org.travel_stories.entity.User;
import org.travel_stories.security.JwtUtil;
import org.travel_stories.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto){
        User user = userService.authenticate(loginDto.getEmail(), loginDto.getPassword());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(new AuthResponseDto(token, user.getUserId(), user.getUsername(), user.getRole()));
    }

}
