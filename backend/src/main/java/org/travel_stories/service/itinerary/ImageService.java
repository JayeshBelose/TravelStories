package org.travel_stories.service.itinerary;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.itinerary.image.response.ImageResponseDto;
import org.travel_stories.entity.itinerary.Image;
import org.travel_stories.entity.itinerary.Location;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.ImageRepository;
import org.travel_stories.repository.itinerary.LocationRepository;
import org.travel_stories.security.auth.AuthorizationService;
import org.travel_stories.service.storage.FileValidationService;
import org.travel_stories.service.storage.FileStorageCategory;
import org.travel_stories.service.storage.StorageService;

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
    private final StorageService storageService;


    public void uploadImage(
            UUID locationId,
            MultipartFile file
    ) {

        String detectedMimeType =
                fileValidationService.validateMimeType(file);

        Location location =
                locationRepository.findById(locationId)
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
                imageRepository.findNextOrderNumber(
                        locationId
                ) + 1;

        String filePath = null;

        try {

            filePath =
                    storageService.store(
                            file,
                            FileStorageCategory.IMAGE
                    );

            Image image = new Image();

            image.setOrderNumber(
                    nextOrderNumber
            );

            image.setFilePath(
                    filePath
            );

            image.setContentType(
                    detectedMimeType
            );

            image.setLocation(
                    location
            );

            imageRepository.save(image);

            log.info(
                    "Image uploaded: imageId={}, locationId={}, orderNumber={}",
                    image.getImageId(),
                    locationId,
                    nextOrderNumber
            );

        } catch (RuntimeException exception) {

            if (filePath != null) {

                try {

                    storageService.delete(
                            filePath
                    );

                } catch (RuntimeException cleanupException) {

                    log.error(
                            "Failed to clean up image after upload failure: {}",
                            filePath,
                            cleanupException
                    );
                }
            }

            throw exception;
        }
    }


    public void deleteImage(UUID imageId) {

        Image image =
                imageRepository.findById(imageId)
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

        int deletedImageNumber =
                image.getOrderNumber();

        UUID locationId =
                image.getLocation()
                        .getLocationId();

        String filePath =
                image.getFilePath();

        imageRepository.delete(image);

        imageRepository.flush();

        storageService.delete(
                filePath
        );

        List<Image> imagesToAdjust =
                imageRepository
                        .findByLocationLocationIdOrderByOrderNumber(
                                locationId
                        );

        for (Image img : imagesToAdjust) {

            if (img.getOrderNumber()
                    > deletedImageNumber) {

                img.setOrderNumber(
                        img.getOrderNumber() - 1
                );
            }
        }

        imageRepository.saveAll(
                imagesToAdjust
        );

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
                .map(image -> new ImageResponseDto(
                        image.getImageId(),
                        image.getContentType(),
                        image.getOrderNumber()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<Image> getAllImages() {

        return imageRepository.findAll()
                .stream()
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


    @Transactional(readOnly = true)
    public Resource getImageResource(Image image) {

        return storageService.load(
                image.getFilePath()
        );
    }

    public long getImageLastModified(Image image) {
        return storageService.getLastModified(image.getFilePath());
    }

}