package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.service.ItineraryService;
import org.travel_stories.service.ItineraryTypeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping
    public ResponseEntity<ItineraryResponseDto> createItinerary(@RequestBody ItineraryRequestDto itineraryRequestDto){
        ItineraryResponseDto itineraryResponseDto = itineraryService.createItinerary(itineraryRequestDto);
        return ResponseEntity.ok().body(itineraryResponseDto);
    }

    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<String> deleteItineraryById(@PathVariable UUID itineraryId){
        itineraryService.deleteItineraryById(itineraryId);
        return ResponseEntity.ok().body("Itinerary deleted");
    }

    @PutMapping("/{itineraryId}")
    public ResponseEntity<ItineraryResponseDto> updateItinerary(
            @RequestBody ItineraryRequestDto itineraryRequestDto,
            @PathVariable UUID itineraryId
    ){
        ItineraryResponseDto itineraryResponseDto = itineraryService.updateItinerary(itineraryRequestDto, itineraryId);
        return ResponseEntity.ok().body(itineraryResponseDto);
    }

    @GetMapping
    public ResponseEntity<List<ItineraryResponseDto>> getAllItineraries(){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItineraries();
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/{typeId}")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByType(@PathVariable Long typeId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByType(typeId);
        return ResponseEntity.ok().body(itineraries);
    }

}
