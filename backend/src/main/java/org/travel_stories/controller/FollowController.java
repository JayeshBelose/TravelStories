package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.FollowRequestDto;
import org.travel_stories.dto.FollowResponseDto;
import org.travel_stories.service.FollowService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/community")
public class FollowController {

    private final FollowService followService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> follow(
            @Valid @RequestBody FollowRequestDto followRequestDto) {

        followService.follow(
                followRequestDto.getFollowerId(),
                followRequestDto.getFollowingId()
        );

        return ResponseEntity.ok(
                ApiResponse.success("User followed successfully")
        );
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> unfollow(
            @Valid @RequestBody FollowRequestDto followRequestDto) {

        followService.unfollow(
                followRequestDto.getFollowerId(),
                followRequestDto.getFollowingId()
        );

        return ResponseEntity.ok(
                ApiResponse.success("User unfollowed successfully")
        );
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<ApiResponse<List<FollowResponseDto>>> getFollowers(
            @PathVariable("userId") UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Followers fetched successfully",
                        followService.getFollowers(userId)
                )
        );
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<ApiResponse<List<FollowResponseDto>>> getFollowing(
            @PathVariable("userId") UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Following list fetched successfully",
                        followService.getFollowing(userId)
                )
        );
    }

}