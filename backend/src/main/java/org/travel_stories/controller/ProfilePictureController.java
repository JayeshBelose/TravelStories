package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.service.ProfilePictureService;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/profilePicture")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> uploadOrUpdate(
            @PathVariable("userId") UUID userId,
            @RequestParam MultipartFile file
    ) throws IOException {

        profilePictureService.uploadOrUpdate(userId, file);

        return ResponseEntity.ok(
                ApiResponse.success("Profile picture updated successfully")
        );
    }

    @GetMapping
    public ResponseEntity<byte[]> getPfpByUser(
            @PathVariable UUID userId) {

        ProfilePicture pfp = profilePictureService.getPfpByUser(userId);

        if (pfp == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(pfp.getContentType()))
                .body(pfp.getPfpData());
    }

}