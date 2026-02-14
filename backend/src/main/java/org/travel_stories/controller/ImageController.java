package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.entity.Image;
import org.travel_stories.service.ImageService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/days/locations/{locationId}/images")
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<String> uploadImage(
            @PathVariable UUID locationId,
            @RequestParam("file") MultipartFile file
    )throws IOException {
        imageService.uploadImage(locationId,file);
        return ResponseEntity.ok().body("Image uploaded.");
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable UUID imageId){
        imageService.deleteImage(imageId);
        return ResponseEntity.ok().body("Image deleted.");
    }

    @GetMapping
    public ResponseEntity<List<ImageResponseDto>> getImagesByLocation(@PathVariable UUID locationId){
        List<ImageResponseDto> images = imageService.getImagesByLocation(locationId);
        return ResponseEntity.ok().body(images);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ImageResponseDto>> getAllImages(){
        List<ImageResponseDto> images = imageService.getAllImages();
        return ResponseEntity.ok().body(images);
    }

}
