package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<byte[]> getThumbnailByItineraryId(
            @PathVariable("itineraryId") UUID itineraryId
    ) {

        Thumbnail thumbnail =
                thumbnailService.getThumbnailByItineraryId(itineraryId);

        byte[] imageData =
                thumbnailService.getThumbnailData(thumbnail);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                thumbnail.getContentType()
                        )
                )
                .body(imageData);
    }
}