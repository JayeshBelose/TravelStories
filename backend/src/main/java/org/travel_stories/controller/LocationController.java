package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<String> addLocation(
            @PathVariable UUID dayId,
            @RequestBody LocationRequestDto locationRequestDto
    ){
        locationService.addLocation(dayId, locationRequestDto);
        return ResponseEntity.ok().body("Location added.");
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<String> removeLocation(
            @PathVariable UUID dayId,
            @PathVariable UUID locationId
    ){
        locationService.removeLocation(dayId, locationId);
        return ResponseEntity.ok().body("Location removed.");
    }

    @GetMapping
    public ResponseEntity<List<LocationResponseDto>> getLocationsByDay(@PathVariable UUID dayId){
        List<LocationResponseDto> locations = locationService.getLocationsByDay(dayId);
        return ResponseEntity.ok().body(locations);
    }

}
