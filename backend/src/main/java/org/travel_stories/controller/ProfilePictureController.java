package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.service.ProfilePictureService;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/{userId}/profilePicture")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;

    @PostMapping
    public ResponseEntity<String> uploadOrUpdate(
            @PathVariable("userId") UUID userId,
            @RequestParam MultipartFile file
    ) throws IOException {
        profilePictureService.uploadOrUpdate(userId, file);
        return ResponseEntity.ok().body("Profile picture updated.");
    }

    @GetMapping
    public ResponseEntity<byte[]> getPfpByUser(@PathVariable UUID userId){
        ProfilePicture pfp = profilePictureService.getPfpByUser(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(pfp.getContentType()))
                .body(pfp.getPfpData());
    }

}
