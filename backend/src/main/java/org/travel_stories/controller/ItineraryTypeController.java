package org.travel_stories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.service.ItineraryTypeService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/itineraries/types")
public class ItineraryTypeController {

    private final ItineraryTypeService itineraryTypeService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItineraryTypeDto>> addType(
            @Valid @RequestBody ItineraryTypeDto requestDto
    ) {

        ItineraryTypeDto responseDto =
                itineraryTypeService.addType(requestDto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Itinerary type added successfully",
                                responseDto
                        )
                );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItineraryTypeDto>>> getAllTypes() {

        List<ItineraryTypeDto> types =
                itineraryTypeService.getAllTypes();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary types fetched successfully",
                        types
                )
        );
    }

    @DeleteMapping("/{typeId}")
    public ResponseEntity<ApiResponse<Void>> deleteType(
            @PathVariable("typeId") Long typeId
    ) {

        itineraryTypeService.deleteTypeById(typeId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary type deleted successfully"
                )
        );
    }

}