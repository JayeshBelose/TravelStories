package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.service.ItineraryMemberService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itinerary/member")
public class ItineraryMemberController {

    private final ItineraryMemberService itineraryMemberService;

    @PostMapping("/{itineraryId}/{userId}")
    public ResponseEntity<String> addMember(@PathVariable UUID itineraryId, @PathVariable UUID userId){
        itineraryMemberService.addMember(itineraryId, userId);
        return ResponseEntity.ok().body("Member Added.");
    }

    @DeleteMapping("/{itineraryId}/{userId}")
    public ResponseEntity<String> removeMember(@PathVariable UUID itineraryId, @PathVariable UUID userId){
        itineraryMemberService.removeMember(itineraryId, userId);
        return ResponseEntity.ok().body("Member Removed.");
    }

}
