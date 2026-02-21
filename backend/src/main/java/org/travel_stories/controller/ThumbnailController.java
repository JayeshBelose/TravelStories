package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.Thumbnail;
import org.travel_stories.service.ThumbnailService;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/{itineraryId}/thumbnail")
public class ThumbnailController {

    private final ThumbnailService thumbnailService;

    @PostMapping
    public ResponseEntity<String> uploadOrUpdate(
            @PathVariable("itineraryId")UUID userId,
            @RequestParam MultipartFile file
    ) throws IOException{
        thumbnailService.uploadOrUpdate(userId, file);
        return ResponseEntity.ok().body("Thumbnail updated.");
    }

    @GetMapping
    public ResponseEntity<byte[]> getThumbnailByItineraryId(@PathVariable("itineraryId") UUID itineraryId){
        Thumbnail thumbnail = thumbnailService.getThumbnailByItineraryId(itineraryId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(thumbnail.getContentType()))
                .body(thumbnail.getThumbnailData());
    }

}
