package org.travel_stories.controller.user;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.entity.user.ProfilePicture;
import org.travel_stories.service.user.ProfilePictureService;

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
    public ResponseEntity<Resource> getProfilePicture(
            @PathVariable UUID userId,
            WebRequest request
    ) {
        ProfilePicture profilePicture =
                profilePictureService.getPfpByUser(userId);

        long lastModified =
                profilePictureService.getProfilePictureLastModified(profilePicture);

        if (request.checkNotModified(lastModified)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }

        Resource resource =
                profilePictureService.getProfilePictureResource(profilePicture);

        return ResponseEntity.ok()
                .lastModified(lastModified)
                .cacheControl(CacheControl.noCache())
                .contentType(
                        MediaType.parseMediaType(profilePicture.getContentType())
                )
                .body(resource);
    }
}