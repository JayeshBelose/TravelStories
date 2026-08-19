package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.Thumbnail;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.ThumbnailRepository;
import org.travel_stories.security.AuthorizationService;
import org.travel_stories.service.storage.FileStorageCategory;
import org.travel_stories.service.storage.FileStorageService;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailService {

    private final ThumbnailRepository thumbnailRepository;
    private final ItineraryRepository itineraryRepository;
    private final AuthorizationService authorizationService;
    private final FileValidationService fileValidationService;
    private final FileStorageService fileStorageService;

    @Transactional
    public void uploadOrUpdate(
            UUID itineraryId,
            MultipartFile file
    ) {

        String detectedMimeType =
                fileValidationService.validateMimeType(file);

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to upload/update thumbnail: itinerary not found, itineraryId={}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Itinerary not found."
                    );
                });

        authorizationService.verifyOwnership(
                itinerary.getCreatedBy().getUserId()
        );

        Optional<Thumbnail> existingThumbnail =
                thumbnailRepository.findByItineraryItineraryId(itineraryId);

        String newFilePath = null;

        try {

            newFilePath =
                    fileStorageService.store(
                            file,
                            FileStorageCategory.THUMBNAIL
                    );

            if (existingThumbnail.isPresent()) {

                Thumbnail thumbnail = existingThumbnail.get();

                String oldFilePath = thumbnail.getFilePath();

                thumbnail.setFilePath(newFilePath);
                thumbnail.setContentType(detectedMimeType);

                thumbnailRepository.save(thumbnail);

                if (oldFilePath != null
                        && !oldFilePath.equals(newFilePath)) {

                    fileStorageService.delete(oldFilePath);
                }

                log.info(
                        "Thumbnail updated for itinerary {}, filePath={}",
                        itineraryId,
                        newFilePath
                );

            } else {

                Thumbnail thumbnail = new Thumbnail();

                thumbnail.setFilePath(newFilePath);
                thumbnail.setContentType(detectedMimeType);
                thumbnail.setItinerary(itinerary);

                thumbnailRepository.save(thumbnail);

                log.info(
                        "Thumbnail uploaded for itinerary {}, filePath={}",
                        itineraryId,
                        newFilePath
                );
            }

        } catch (RuntimeException exception) {

            /*
             * If database persistence fails after the physical
             * file has been created, clean up the newly stored file.
             */
            if (newFilePath != null) {

                try {

                    fileStorageService.delete(
                            newFilePath
                    );

                } catch (RuntimeException cleanupException) {

                    log.error(
                            "Failed to clean up thumbnail after upload failure: {}",
                            newFilePath,
                            cleanupException
                    );
                }
            }

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public Thumbnail getThumbnailByItineraryId(
            UUID itineraryId
    ) {

        return thumbnailRepository
                .findByItineraryItineraryId(itineraryId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to fetch thumbnail: thumbnail not found, itineraryId={}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Thumbnail not found."
                    );
                });
    }

    @Transactional(readOnly = true)
    public Resource getThumbnailResource(Thumbnail thumbnail) {

        return fileStorageService.load(
                thumbnail.getFilePath()
        );
    }

}