package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.DayRequestDto;
import org.travel_stories.dto.DayResponseDto;
import org.travel_stories.service.DayService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/{itineraryId}/days")
public class DayController {

    private final DayService dayService;

    @PostMapping
    public ResponseEntity<ApiResponse<DayResponseDto>> addDay(
            @PathVariable UUID itineraryId,
            @Valid @RequestBody DayRequestDto dayRequestDto
    ) {
        DayResponseDto dayResponseDto = dayService.addDay(itineraryId, dayRequestDto);

        return ResponseEntity.ok(
                ApiResponse.success("Day added successfully", dayResponseDto)
        );
    }

    @DeleteMapping("/{dayId}")
    public ResponseEntity<ApiResponse<Void>> removeDay(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayId
    ) {
        dayService.removeDay(itineraryId, dayId);

        return ResponseEntity.ok(
                ApiResponse.success("Day removed successfully")
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DayResponseDto>>> getDaysByItinerary(
            @PathVariable("itineraryId") UUID itineraryId
    ) {
        List<DayResponseDto> days = dayService.getDaysByItinerary(itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success("Days fetched successfully", days)
        );
    }

    @PutMapping("/{dayId}")
    public ResponseEntity<ApiResponse<Void>> updateDay(
            @PathVariable("dayId") UUID dayId,
            @Valid @RequestBody DayRequestDto dayRequestDto
    ) {
        dayService.updateDay(dayId, dayRequestDto);

        return ResponseEntity.ok(
                ApiResponse.success("Day updated successfully")
        );
    }

}
