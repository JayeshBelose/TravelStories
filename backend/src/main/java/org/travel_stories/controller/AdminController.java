package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.*;
import org.travel_stories.service.AdminService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok().body(adminService.getStats());
    }

    @GetMapping("/itineraries/recent")
    public ResponseEntity<List<ItineraryResponseDto>> getRecentItineraries() {
        List<ItineraryResponseDto> itineraryResponseDtos = adminService.getRecentItineraries();
        return ResponseEntity.ok().body(itineraryResponseDtos);
    }

    @GetMapping("/itineraries")
    public Page<ItineraryResponseDto> getAllItineraries(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "recent") String sort
    ) {
        return adminService.getAllItineraries(page, size, search, filter, type, sort);
    }

    @GetMapping("/activity/weekly")
    public ResponseEntity<List<WeeklyActivityDto>> getWeeklyActivity() {
        List<WeeklyActivityDto> weeklyActivityDtos = adminService.getWeeklyActivity();
        return ResponseEntity.ok().body(weeklyActivityDtos);
    }

    @DeleteMapping("/itineraries/{itineraryId}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable("itineraryId")UUID itineraryId) {
        adminService.deleteItinerary(itineraryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public Page<UserResponseDto> getAllUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getAllUsers(search, page, size);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId")UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/itineraries/types")
    public ResponseEntity<List<ItineraryTypeDto>> getAllTypes() {
        List<ItineraryTypeDto> types = adminService.getAllTypes();
        return ResponseEntity.ok().body(types);
    }

    @PostMapping("/itineraries/types/{name}")
    public ResponseEntity<Void> addType(@PathVariable("name") String name) {
        adminService.addType(name);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/itineraries/types/{typeId}")
    public ResponseEntity<Void> deleteType(@PathVariable("typeId") Long typeId) {
        adminService.deleteType(typeId);
        return ResponseEntity.noContent().build();
    }

}
