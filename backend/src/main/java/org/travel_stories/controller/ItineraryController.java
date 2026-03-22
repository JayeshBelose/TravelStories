package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.service.ItineraryService;
import org.travel_stories.service.ItineraryTypeService;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<ItineraryResponseDto> createItinerary(
            @RequestBody String data,
            @PathVariable("userId") UUID userId
    ){
        ObjectMapper mapper = new ObjectMapper();
        ItineraryRequestDto itineraryRequestDto = mapper.readValue(data, ItineraryRequestDto.class);

        ItineraryResponseDto itineraryResponseDto = itineraryService.createItinerary(itineraryRequestDto, userId);
        return ResponseEntity.ok().body(itineraryResponseDto);
    }

    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<String> deleteItineraryById(@PathVariable UUID itineraryId){
        itineraryService.deleteItineraryById(itineraryId);
        return ResponseEntity.ok().body("Itinerary deleted");
    }

    @PutMapping("/{itineraryId}")
    public ResponseEntity<ItineraryResponseDto> updateItinerary(
            @RequestBody String data,
            @PathVariable UUID itineraryId
    ){
        ObjectMapper mapper = new ObjectMapper();
        ItineraryRequestDto itineraryRequestDto = mapper.readValue(data, ItineraryRequestDto.class);

        ItineraryResponseDto itineraryResponseDto = itineraryService.updateItinerary(itineraryRequestDto, itineraryId);
        return ResponseEntity.ok().body(itineraryResponseDto);
    }

    @GetMapping
    public Page<ItineraryResponseDto> getItineraries(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return itineraryService.getItineraries(search, type, sort, page, size);
    }

    @GetMapping("/types/{typeId}")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByType(@PathVariable("typeId") Long typeId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByType(typeId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByUserId(@PathVariable("userId") UUID userId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByUserId(userId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/{itineraryId}")
    public ResponseEntity<ItineraryResponseDto> getItineraryById(@PathVariable("itineraryId") UUID itineraryId){
        ItineraryResponseDto itinerary = itineraryService.getItineraryById(itineraryId);
        return ResponseEntity.ok().body(itinerary);
    }

    @GetMapping("/{userId}/membership")
    public ResponseEntity<List<ItineraryResponseDto>> getAllItinerariesByUserMembership(@PathVariable("userId") UUID userId){
        List<ItineraryResponseDto> itineraries = itineraryService.getAllItinerariesByUserMembership(userId);
        return ResponseEntity.ok().body(itineraries);
    }

    @GetMapping("/{userId}/saved")
    public ResponseEntity<List<ItineraryResponseDto>> getAllSavedItinerariesByUserId(@PathVariable("userId") UUID userId){
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
