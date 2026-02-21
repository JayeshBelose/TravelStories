package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.service.ItineraryTypeService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/itineraries/types")
public class ItineraryTypeController {

    private final ItineraryTypeService itineraryTypeService;

    @PostMapping
    public ResponseEntity<ItineraryTypeDto> addType(@RequestBody ItineraryTypeDto requestDto){
        ItineraryTypeDto itineraryTypeDto = itineraryTypeService.addType(requestDto);
        return ResponseEntity.ok().body(itineraryTypeDto);
    }

    @GetMapping
    public ResponseEntity<List<ItineraryTypeDto>> getAllTypes(){
        List<ItineraryTypeDto> types = itineraryTypeService.getAllTypes();

        return ResponseEntity.ok().body(types);
    }

    @DeleteMapping("/{typeId}")
    public ResponseEntity<String> deleteType(@PathVariable("typeId") Long typeId){
        itineraryTypeService.deleteTypeById(typeId);

        return ResponseEntity.ok("Type Deleted.");
    }

}
