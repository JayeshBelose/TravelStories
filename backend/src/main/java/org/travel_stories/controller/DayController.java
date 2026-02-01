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
@RequestMapping("/api/itinerary/day")
public class DayController {

    private final DayService dayService;

    @PostMapping("/{itineraryId}")
    public ResponseEntity<List<DayResponseDto>> addDay(
            @PathVariable UUID itineraryId,
            @RequestBody DayRequestDto dayRequestDto
    ){
        List<DayResponseDto> days = dayService.addDay(itineraryId,dayRequestDto);
        return ResponseEntity.ok().body(days);
    }

    @DeleteMapping("/{itineraryId}/{dayId}")
    public ResponseEntity<List<DayResponseDto>> removeDay(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayId
    ){
        List<DayResponseDto> days = dayService.removeDay(itineraryId,dayId);
        return ResponseEntity.ok().body(days);
    }

}
