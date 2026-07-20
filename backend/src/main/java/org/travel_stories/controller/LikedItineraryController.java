package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.service.LikedItineraryService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/likedItineraries")
public class LikedItineraryController {

    private final LikedItineraryService likedItineraryService;

    @Transactional
    @PostMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<String>> likeItinerary(
            @PathVariable("userId") UUID userId,
            @PathVariable("itineraryId") UUID itineraryId) {

        String message = likedItineraryService.likeItinerary(userId, itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success(message, message)
        );
    }

    @Transactional
    @GetMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Boolean>> checkIfLiked(
            @PathVariable("userId") UUID userId,
            @PathVariable("itineraryId") UUID itineraryId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Like status fetched successfully",
                        likedItineraryService.checkIfLiked(userId, itineraryId)
                )
        );
    }

}
