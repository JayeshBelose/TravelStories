package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.service.ItineraryService;
import org.travel_stories.service.ItineraryTypeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final ItineraryTypeService itineraryTypeService;
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

    @PostMapping("/type")
    public ResponseEntity<ItineraryTypeDto> addType(@RequestBody ItineraryTypeDto requestDto){
        ItineraryTypeDto itineraryTypeDto = itineraryTypeService.addType(requestDto);
        return ResponseEntity.ok().body(itineraryTypeDto);
    }

    @GetMapping("/type")
    public ResponseEntity<List<ItineraryTypeDto>> getAllTypes(){
        List<ItineraryTypeDto> types = itineraryTypeService.getAllTypes();

        return ResponseEntity.ok().body(types);
    }

    @DeleteMapping("/type/{name}")
    public ResponseEntity<String> deleteTypeByName(@PathVariable("name") String name){
        itineraryTypeService.deleteTypeByName(name);

        return ResponseEntity.ok("Type Deleted.");
    }

}
