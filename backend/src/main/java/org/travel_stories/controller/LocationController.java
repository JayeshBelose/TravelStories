package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.LocationRequestDto;
import org.travel_stories.dto.LocationResponseDto;
import org.travel_stories.service.LocationService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/days/{dayId}/locations")
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<ApiResponse<LocationResponseDto>> addLocation(
            @PathVariable("dayId") UUID dayId,
            @Valid @RequestBody LocationRequestDto locationRequestDto
    ) {

        LocationResponseDto responseDto =
                locationService.addLocation(dayId, locationRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Location added successfully",
                                responseDto
                        )
                );
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<ApiResponse<Void>> removeLocation(
            @PathVariable("dayId") UUID dayId,
            @PathVariable("locationId") UUID locationId
    ) {

        locationService.removeLocation(dayId, locationId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Location removed successfully"
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LocationResponseDto>>> getLocationsByDay(
            @PathVariable("dayId") UUID dayId
    ) {

        List<LocationResponseDto> locations =
                locationService.getLocationsByDay(dayId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Locations fetched successfully",
                        locations
                )
        );
    }

    @PutMapping("/{locationId}")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @PathVariable("locationId") UUID locationId,
            @Valid @RequestBody LocationRequestDto locationRequestDto
    ) {

        locationService.updateLocation(locationId, locationRequestDto);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Location updated successfully"
                )
        );
    }

}