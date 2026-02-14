package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.service.LikedItineraryService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/likedItineraries")
public class LikedItineraryController {

    private final LikedItineraryService likedItineraryService;

    @Transactional
    @PostMapping("/{itineraryId}")
    public ResponseEntity<String> likeItinerary(@PathVariable("userId") UUID userId, @PathVariable("itineraryId") UUID itineraryId){
        String msg = likedItineraryService.likeItinerary(userId, itineraryId);
        return ResponseEntity.ok().body(msg);
    }

    @Transactional
    @GetMapping("/{itineraryId}")
    public ResponseEntity<Boolean> checkIfLiked(@PathVariable("userId") UUID userId, @PathVariable("itineraryId") UUID itineraryId){
        return ResponseEntity.ok().body(likedItineraryService.checkIfLiked(userId, itineraryId));
    }

}
