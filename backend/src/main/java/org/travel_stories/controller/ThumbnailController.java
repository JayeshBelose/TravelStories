package org.travel_stories.controller;

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
import org.travel_stories.entity.Thumbnail;
import org.travel_stories.service.ThumbnailService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/{itineraryId}/thumbnail")
public class ThumbnailController {

    private final ThumbnailService thumbnailService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> uploadOrUpdate(
            @PathVariable("itineraryId") UUID itineraryId,
            @RequestParam("file") MultipartFile file
    ) {

        thumbnailService.uploadOrUpdate(itineraryId, file);

        return ResponseEntity.ok(
                ApiResponse.success("Thumbnail updated successfully")
        );
    }

    @GetMapping
    public ResponseEntity<Resource> getThumbnailByItineraryId(
            @PathVariable UUID itineraryId,
            WebRequest request
    ) {
        Thumbnail thumbnail =
                thumbnailService.getThumbnailByItineraryId(itineraryId);

        long lastModified =
                thumbnailService.getThumbnailLastModified(thumbnail);

        if (request.checkNotModified(lastModified)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }

        Resource resource =
                thumbnailService.getThumbnailResource(thumbnail);

        return ResponseEntity.ok()
                .lastModified(lastModified)
                .cacheControl(CacheControl.noCache())
                .contentType(
                        MediaType.parseMediaType(thumbnail.getContentType())
                )
                .body(resource);
    }
}