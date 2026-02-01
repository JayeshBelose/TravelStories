package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.service.ItineraryTypeService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itinerary")
public class ItineraryTypeController {

    private final ItineraryTypeService itineraryTypeService;

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

    @DeleteMapping("/type/{typeId}")
    public ResponseEntity<String> deleteTypeByName(@PathVariable("typeId") Long typeId){
        itineraryTypeService.deleteTypeById(typeId);

        return ResponseEntity.ok("Type Deleted.");
    }

}
