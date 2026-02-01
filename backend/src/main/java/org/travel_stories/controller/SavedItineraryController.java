package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.service.SavedItineraryService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/savedItinerary")
public class SavedItineraryController {

    private final SavedItineraryService savedItineraryService;

    @Transactional
    @PostMapping("/{userId}/{itineraryId}")
    public ResponseEntity<String> saveItinerary(@PathVariable UUID userId, @PathVariable UUID itineraryId){
        savedItineraryService.saveItinerary(userId, itineraryId);
        return ResponseEntity.ok().body("Itinerary Saved.");
    }

    @Transactional
    @DeleteMapping("/{userId}/{itineraryId}")
    public ResponseEntity<String> removeItinerary(@PathVariable UUID userId, @PathVariable UUID itineraryId){
        savedItineraryService.removeItinerary(userId, itineraryId);
        return ResponseEntity.ok().body("Itinerary Removed.");
    }

}
