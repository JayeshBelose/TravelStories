package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.service.ProfilePictureService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/profilePicture")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> uploadOrUpdate(
            @PathVariable("userId") UUID userId,
            @RequestParam("file") MultipartFile file
    ) {

        profilePictureService.uploadOrUpdate(userId, file);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile picture updated successfully"
                )
        );
    }

    @GetMapping
    public ResponseEntity<Resource> getPfpByUser(
            @PathVariable("userId") UUID userId
    ) {

        ProfilePicture pfp =
                profilePictureService.getPfpByUser(userId);

        Resource resource =
                profilePictureService.getProfilePictureResource(pfp);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                pfp.getContentType()
                        )
                )
                .body(resource);
    }
}