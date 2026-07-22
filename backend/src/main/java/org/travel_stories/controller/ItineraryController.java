package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.service.ItineraryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService itineraryService;


    @PostMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<ItineraryResponseDto>> createItinerary(
            @Valid @RequestBody ItineraryRequestDto itineraryRequestDto,
            @PathVariable("userId") UUID userId
    ) {

        ItineraryResponseDto itineraryResponseDto =
                itineraryService.createItinerary(
                        itineraryRequestDto,
                        userId
                );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Itinerary created successfully",
                                itineraryResponseDto
                        )
                );
    }


    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Void>> deleteItineraryById(
            @PathVariable UUID itineraryId) {

        itineraryService.deleteItineraryById(itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary deleted successfully"
                )
        );
    }


    @PutMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<ItineraryResponseDto>> updateItinerary(
            @Valid @RequestBody ItineraryRequestDto itineraryRequestDto,
            @PathVariable UUID itineraryId
    ) {

        ItineraryResponseDto itineraryResponseDto =
                itineraryService.updateItinerary(
                        itineraryRequestDto,
                        itineraryId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary updated successfully",
                        itineraryResponseDto
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<Page<ItineraryResponseDto>>> getItineraries(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itineraries fetched successfully",
                        itineraryService.getItineraries(
                                search,
                                type,
                                sort,
                                page,
                                size
                        )
                )
        );
    }


    @GetMapping("/types/{typeId}")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getAllItinerariesByType(
            @PathVariable Long typeId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itineraries fetched successfully",
                        itineraryService.getAllItinerariesByType(typeId)
                )
        );
    }


    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getAllItinerariesByUserId(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User itineraries fetched successfully",
                        itineraryService.getAllItinerariesByUserId(userId)
                )
        );
    }


    @GetMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<ItineraryResponseDto>> getItineraryById(
            @PathVariable UUID itineraryId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary fetched successfully",
                        itineraryService.getItineraryById(itineraryId)
                )
        );
    }


    @GetMapping("/{userId}/membership")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getAllItinerariesByUserMembership(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Membership itineraries fetched successfully",
                        itineraryService.getAllItinerariesByUserMembership(userId)
                )
        );
    }


    @GetMapping("/{userId}/saved")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getAllSavedItinerariesByUserId(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Saved itineraries fetched successfully",
                        itineraryService.getAllSavedItinerariesByUserId(userId)
                )
        );
    }


    @GetMapping("/mostSaved")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getMostSavedItineraries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Most saved itineraries fetched successfully",
                        itineraryService.getMostSavedItineraries()
                )
        );
    }


    @GetMapping("/mostLiked")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getMostLikedItineraries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Most liked itineraries fetched successfully",
                        itineraryService.getMostLikedItineraries()
                )
        );
    }

}