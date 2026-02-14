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
@RequestMapping("/api/itineraries")
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

    @GetMapping("/{userId}")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByUserId(@PathVariable UUID userId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByUserId(userId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/{userId}/membership")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByUserMembership(@PathVariable UUID userId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByUserMembership(userId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/{userId}/saved")
    public ResponseEntity<List<ItineraryResponseDto>> getAllSavedItinerariesByUserId(@PathVariable UUID userId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllSavedItinerariesByUserId(userId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/mostSaved")
    public ResponseEntity<List<ItineraryResponseDto>> getMostSavedItineraries(){
        List<ItineraryResponseDto> itineraries = itineraryService.getMostSavedItineraries();
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/mostLiked")
    public ResponseEntity<List<ItineraryResponseDto>> getMostLikedItineraries(){
        List<ItineraryResponseDto> itineraries = itineraryService.getMostLikedItineraries();
        return ResponseEntity.ok().body(itineraries);
    }

}
