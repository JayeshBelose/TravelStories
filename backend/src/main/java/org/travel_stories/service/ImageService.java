package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.entity.Image;
import org.travel_stories.entity.Location;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ImageRepository;
import org.travel_stories.repository.LocationRepository;
import org.travel_stories.security.AuthorizationService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ImageService {

    private final ImageRepository imageRepository;
    private final LocationRepository locationRepository;
    private final AuthorizationService authorizationService;
    private final FileValidationService fileValidationService;

    public ImageResponseDto map(Image image) {

        return new ImageResponseDto(
                image.getImageId(),
                image.getImageData()
        );
    }


    public void uploadImage(
            UUID locationId,
            MultipartFile file
    ) {
        String detectedMimeType =
                fileValidationService.validateMimeType(file);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to upload image. Location not found: {}",
                            locationId
                    );
                    return new ResourceNotFoundException(
                            "Location not found."
                    );
                });

        authorizationService.verifyOwnership(
                location.getDay()
                        .getItinerary()
                        .getCreatedBy()
                        .getUserId()
        );

        int nextOrderNumber =
                imageRepository.findNextOrderNumber(locationId) + 1;

        Image image = new Image();

        try {

            image.setOrderNumber(nextOrderNumber);
            image.setImageData(file.getBytes());
            image.setContentType(detectedMimeType);
            image.setLocation(location);

        } catch (IOException exception) {

            log.error(
                    "Failed to read image file for location {}",
                    locationId,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to process image file."
            );
        }

        imageRepository.save(image);

        log.info(
                "Image uploaded: imageId={}, locationId={}, orderNumber={}",
                image.getImageId(),
                locationId,
                nextOrderNumber
        );
    }


    public void deleteImage(UUID imageId) {

        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to delete image. Image not found: {}",
                            imageId
                    );
                    return new ResourceNotFoundException(
                            "Image not found."
                    );
                });

        authorizationService.verifyOwnership(
                image.getLocation()
                        .getDay()
                        .getItinerary()
                        .getCreatedBy()
                        .getUserId()
        );

        int deletedImageNumber = image.getOrderNumber();

        UUID locationId =
                image.getLocation().getLocationId();


        imageRepository.delete(image);
        imageRepository.flush();


        List<Image> imagesToAdjust =
                imageRepository
                        .findByLocationLocationIdOrderByOrderNumber(
                                locationId
                        );


        for (Image img : imagesToAdjust) {

            if (img.getOrderNumber() > deletedImageNumber) {

                img.setOrderNumber(
                        img.getOrderNumber() - 1
                );
            }
        }


        imageRepository.saveAll(imagesToAdjust);


        log.info(
                "Image deleted: imageId={}, locationId={}, orderNumber={}",
                imageId,
                locationId,
                deletedImageNumber
        );
    }


    @Transactional(readOnly = true)
    public List<ImageResponseDto> getImagesByLocation(UUID locationId) {

        return imageRepository
                .findByLocationLocationIdOrderByOrderNumber(locationId)
                .stream()
                .map(this::map)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ImageResponseDto> getAllImages() {

        return imageRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }


    @Transactional(readOnly = true)
    public Image getImageById(UUID imageId) {

        return imageRepository.findById(imageId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to retrieve image. Image not found: {}",
                            imageId
                    );
                    return new ResourceNotFoundException(
                            "Image not found."
                    );
                });
    }

}