package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.travel_stories.dto.UserRequestDto;
import org.travel_stories.dto.UserResponseDto;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.service.SavedItineraryService;
import org.travel_stories.service.UserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final SavedItineraryService savedItineraryService;

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserRequestDto userRequestDto){
        UserResponseDto userResponseDto = userService.createUser(userRequestDto);

        return ResponseEntity.ok().body(userResponseDto);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable("userId") UUID userId){
        UserResponseDto userResponseDto = userService.getUserById(userId);

        return ResponseEntity.ok().body(userResponseDto);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(){
        List<UserResponseDto> users = userService.getAllUsers();

        return ResponseEntity.ok().body(users);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable("userId") UUID userId){
        userService.deleteUser(userId);

        return ResponseEntity.ok("User deleted.");
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponseDto> updateUser(
            @RequestBody UserRequestDto userRequestDto,
            @PathVariable("userId") UUID userId
    ){
        UserResponseDto userResponseDto = userService.updateUser(userRequestDto, userId);

        return ResponseEntity.ok().body(userResponseDto);
    }

    @Transactional
    @PostMapping("/savedItinerary/{userId}/{itineraryId}")
    public ResponseEntity<String> saveItinerary(@PathVariable UUID userId, @PathVariable UUID itineraryId){
        savedItineraryService.saveItinerary(userId, itineraryId);
        return ResponseEntity.ok().body("Itinerary Saved.");
    }

    @Transactional
    @DeleteMapping("/savedItinerary/{userId}/{itineraryId}")
    public ResponseEntity<String> removeItinerary(@PathVariable UUID userId, @PathVariable UUID itineraryId){
        savedItineraryService.removeItinerary(userId, itineraryId);
        return ResponseEntity.ok().body("Itinerary Removed.");
    }

}
