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
@RequestMapping("/api/itineraries/days/locations")
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/{locationId}/images")
    public ResponseEntity<String> uploadImage(
            @PathVariable UUID locationId,
            @RequestParam("file") MultipartFile file
    )throws IOException {
        imageService.uploadImage(locationId,file);
        return ResponseEntity.ok().body("Image uploaded.");
    }

    @DeleteMapping("/{locationId}/images/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable UUID imageId){
        imageService.deleteImage(imageId);
        return ResponseEntity.ok().body("Image deleted.");
    }

    @GetMapping("/{locationId}/images")
    public ResponseEntity<List<ImageResponseDto>> getImagesByLocation(@PathVariable UUID locationId){
        List<ImageResponseDto> images = imageService.getImagesByLocation(locationId);
        return ResponseEntity.ok().body(images);
    }

    @GetMapping("/images")
    public ResponseEntity<List<ImageResponseDto>> getAllImages(){
        List<ImageResponseDto> images = imageService.getAllImages();
        return ResponseEntity.ok().body(images);
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImageId(@PathVariable UUID imageId){
        return ResponseEntity.ok().body(imageService.getImageById(imageId));
    }

}
