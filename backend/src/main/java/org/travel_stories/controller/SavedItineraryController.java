package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.service.SavedItineraryService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/savedItineraries")
public class SavedItineraryController {

    private final SavedItineraryService savedItineraryService;

    @PostMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Void>> saveItinerary(
            @PathVariable UUID userId,
            @PathVariable UUID itineraryId) {

        String message = savedItineraryService.saveItinerary(userId, itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success(message)
        );
    }

    @GetMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Boolean>> checkIfSaved(
            @PathVariable("userId") UUID userId,
            @PathVariable("itineraryId") UUID itineraryId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Saved status fetched successfully",
                        savedItineraryService.checkIfSaved(userId, itineraryId)
                )
        );
    }

}