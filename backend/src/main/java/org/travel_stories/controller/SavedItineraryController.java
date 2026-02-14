package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.service.SavedItineraryService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/savedItineraries")
public class SavedItineraryController {

    private final SavedItineraryService savedItineraryService;

    @Transactional
    @PostMapping("/{itineraryId}")
    public ResponseEntity<String> saveItinerary(@PathVariable UUID userId, @PathVariable UUID itineraryId){
        String msg = savedItineraryService.saveItinerary(userId, itineraryId);
        return ResponseEntity.ok().body(msg);
    }

    @Transactional
    @GetMapping("/{itineraryId}")
    public ResponseEntity<Boolean> checkIfSaved(@PathVariable("userId") UUID userId, @PathVariable("itineraryId") UUID itineraryId){
        return ResponseEntity.ok().body(savedItineraryService.checkIfSaved(userId, itineraryId));
    }

}
