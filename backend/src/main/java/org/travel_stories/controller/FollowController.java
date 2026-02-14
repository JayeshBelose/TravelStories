package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.FollowRequestDto;
import org.travel_stories.dto.FollowResponseDto;
import org.travel_stories.service.FollowService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class FollowController {

    private final FollowService followService;

    @PostMapping
    public ResponseEntity<Void> follow(@RequestBody FollowRequestDto followRequestDto){
        followService.follow(followRequestDto.getFollowerId(), followRequestDto.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unfollow(@RequestBody FollowRequestDto followRequestDto){
        followService.unfollow(followRequestDto.getFollowerId(), followRequestDto.getFollowingId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<FollowResponseDto>> getFollowers(@PathVariable("userId")UUID userId){
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<FollowResponseDto>> getFollowing(@PathVariable("userId")UUID userId){
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

}
