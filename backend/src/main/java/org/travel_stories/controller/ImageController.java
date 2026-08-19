package org.travel_stories.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.common.ApiResponse;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.entity.Image;
import org.travel_stories.service.ImageService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries/days/locations")
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/{locationId}/images")
    public ResponseEntity<ApiResponse<Void>> uploadImage(
            @PathVariable UUID locationId,
            @RequestParam("file") MultipartFile file
    ) {

        imageService.uploadImage(locationId, file);

        return ResponseEntity.ok(
                ApiResponse.success("Image uploaded successfully")
        );
    }


    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable UUID imageId) {

        imageService.deleteImage(imageId);

        return ResponseEntity.ok(
                ApiResponse.success("Image deleted successfully")
        );
    }


    @GetMapping("/{locationId}/images")
    public ResponseEntity<ApiResponse<List<ImageResponseDto>>> getImagesByLocation(
            @PathVariable UUID locationId) {

        List<ImageResponseDto> images =
                imageService.getImagesByLocation(locationId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Images fetched successfully",
                        images
                )
        );
    }


    @GetMapping("/images")
    public ResponseEntity<ApiResponse<List<Image>>> getAllImages() {

        List<Image> images =
                imageService.getAllImages();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Images fetched successfully",
                        images
                )
        );
    }


    @GetMapping("/images/{imageId}")
    public ResponseEntity<Resource> getImageById(
            @PathVariable UUID imageId
    ) {

        Image image =
                imageService.getImageById(imageId);

        Resource resource =
                imageService.getImageResource(image);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                image.getContentType()
                        )
                )
                .body(resource);
    }

}