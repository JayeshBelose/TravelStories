package org.travel_stories.controller.itinerary;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.itinerary.response.ItineraryListResponseDto;
import org.travel_stories.dto.itinerary.request.ItineraryRequestDto;
import org.travel_stories.dto.itinerary.response.ItineraryResponseDto;
import org.travel_stories.service.itinerary.ItineraryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService itineraryService;

    private static final int MAX_EXPLORE_PAGE_SIZE = 15;

    private static final int MAX_USER_ITINERARY_PAGE_SIZE = 15;

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
    public ResponseEntity<ApiResponse<Page<ItineraryListResponseDto>>> getItineraries(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_EXPLORE_PAGE_SIZE);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itineraries fetched successfully",
                        itineraryService.getItineraries(
                                search,
                                type,
                                sort,
                                safePage,
                                safeSize
                        )
                )
        );
    }


    @GetMapping("/types/{typeId}")
    public ResponseEntity<ApiResponse<List<ItineraryListResponseDto>>> getAllItinerariesByType(
            @PathVariable Long typeId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itineraries fetched successfully",
                        itineraryService.getAllItinerariesByType(typeId)
                )
        );
    }


    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Page<ItineraryListResponseDto>>> getAllItinerariesByUserId(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_USER_ITINERARY_PAGE_SIZE);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User itineraries fetched successfully",
                        itineraryService.getAllItinerariesByUserId(
                                userId,
                                safePage,
                                safeSize
                        )
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
    public ResponseEntity<ApiResponse<Page<ItineraryListResponseDto>>> getAllItinerariesByUserMembership(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_USER_ITINERARY_PAGE_SIZE);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Membership itineraries fetched successfully",
                        itineraryService.getAllItinerariesByUserMembership(
                                userId,
                                safePage,
                                safeSize
                        )
                )
        );
    }


    @GetMapping("/{userId}/saved")
    public ResponseEntity<ApiResponse<Page<ItineraryListResponseDto>>> getAllSavedItinerariesByUserId(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_USER_ITINERARY_PAGE_SIZE);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Saved itineraries fetched successfully",
                        itineraryService.getAllSavedItinerariesByUserId(
                                userId,
                                safePage,
                                safeSize
                        )
                )
        );
    }


    @GetMapping("/mostSaved")
    public ResponseEntity<ApiResponse<List<ItineraryListResponseDto>>>
    getMostSavedItineraries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Most saved itineraries fetched successfully",
                        itineraryService.getMostSavedItineraries()
                )
        );
    }


    @GetMapping("/mostLiked")
    public ResponseEntity<ApiResponse<List<ItineraryListResponseDto>>>
    getMostLikedItineraries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Most liked itineraries fetched successfully",
                        itineraryService.getMostLikedItineraries()
                )
        );
    }

}