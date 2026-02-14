package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<String> addDay(
            @PathVariable UUID itineraryId,
            @RequestBody DayRequestDto dayRequestDto
    ){
        dayService.addDay(itineraryId,dayRequestDto);
        return ResponseEntity.ok().body("Day added.");
    }

    @DeleteMapping("/{dayId}")
    public ResponseEntity<String> removeDay(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayId
    ){
        dayService.removeDay(itineraryId,dayId);
        return ResponseEntity.ok().body("Day removed.");
    }

    @GetMapping
    public ResponseEntity<List<DayResponseDto>> getDaysByItinerary(@PathVariable UUID itineraryId){
        List<DayResponseDto> days = dayService.getDaysByItinerary(itineraryId);
        return ResponseEntity.ok().body(days);
    }

}
