package org.travel_stories.controller.itinerary;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.service.itinerary.ItineraryMemberService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/members")
public class ItineraryMemberController {

    private final ItineraryMemberService itineraryMemberService;

    @PostMapping("/{itineraryId}/{userId}")
    public ResponseEntity<ApiResponse<Void>> addMember(
            @PathVariable UUID itineraryId,
            @PathVariable UUID userId) {

        itineraryMemberService.addMember(itineraryId, userId);

        return ResponseEntity.ok(
                ApiResponse.success("Member added successfully")
        );
    }

    @DeleteMapping("/{itineraryId}/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID itineraryId,
            @PathVariable UUID userId) {

        itineraryMemberService.removeMember(itineraryId, userId);

        return ResponseEntity.ok(
                ApiResponse.success("Member removed successfully")
        );
    }

}
