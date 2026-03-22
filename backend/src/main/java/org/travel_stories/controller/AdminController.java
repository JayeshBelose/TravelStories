package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.*;
import org.travel_stories.entity.User;
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
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = adminService.getAllUsers();
        return ResponseEntity.ok().body(users);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId")UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

}
