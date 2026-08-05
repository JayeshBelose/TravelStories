package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.common.ApiResponse;
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
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin statistics fetched successfully",
                        adminService.getStats()
                )
        );
    }

    @GetMapping("/itineraries/recent")
    public ResponseEntity<ApiResponse<List<ItineraryResponseDto>>> getRecentItineraries() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Recent itineraries fetched successfully",
                        adminService.getRecentItineraries()
                )
        );
    }

    @GetMapping("/itineraries")
    public ResponseEntity<ApiResponse<Page<ItineraryResponseDto>>> getAllItineraries(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "filter", defaultValue = "ALL") String filter,
            @RequestParam(value = "type", defaultValue = "all") String type,
            @RequestParam(value = "sort", defaultValue = "recent") String sort
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itineraries fetched successfully",
                        adminService.getAllItineraries(
                                page,
                                size,
                                search,
                                filter,
                                type,
                                sort
                        )
                )
        );
    }

    @GetMapping("/activity/weekly")
    public ResponseEntity<ApiResponse<List<WeeklyActivityDto>>> getWeeklyActivity() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Weekly activity fetched successfully",
                        adminService.getWeeklyActivity()
                )
        );
    }

    @DeleteMapping("/itineraries/{itineraryId}")
    public ResponseEntity<ApiResponse<Void>> deleteItinerary(
            @PathVariable("itineraryId") UUID itineraryId
    ) {

        adminService.deleteItinerary(itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success("Itinerary deleted successfully")
        );
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getAllUsers(
            @RequestParam(value = "search", defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully",
                        adminService.getAllUsers(search, page, size)
                )
        );
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable("userId") UUID userId
    ) {

        adminService.deleteUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User deleted successfully")
        );
    }

    @GetMapping("/itineraries/types")
    public ResponseEntity<ApiResponse<List<ItineraryTypeDto>>> getAllTypes() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary types fetched successfully",
                        adminService.getAllTypes()
                )
        );
    }

    @PostMapping("/itineraries/types/{name}")
    public ResponseEntity<ApiResponse<Void>> addType(
            @PathVariable("name") String name
    ) {

        adminService.addType(name);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Itinerary type added successfully"
                        )
                );
    }

    @DeleteMapping("/itineraries/types/{typeId}")
    public ResponseEntity<ApiResponse<Void>> deleteType(
            @PathVariable("typeId") Long typeId
    ) {

        adminService.deleteType(typeId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary type deleted successfully"
                )
        );
    }

}