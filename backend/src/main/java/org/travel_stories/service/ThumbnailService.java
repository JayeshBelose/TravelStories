package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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


        if (existingThumbnail.isPresent()) {

            Thumbnail thumbnail = existingThumbnail.get();

            try {

                thumbnail.setThumbnailData(file.getBytes());

            } catch (IOException exception) {

                log.error(
                        "Failed to read thumbnail file for itinerary {}",
                        itineraryId,
                        exception
                );

                throw new InvalidOperationException(
                        "Unable to process thumbnail file."
                );
            }
            thumbnail.setContentType(detectedMimeType);


            log.info(
                    "Thumbnail updated for itinerary {}",
                    itineraryId
            );

        } else {

            Thumbnail thumbnail = new Thumbnail();

            thumbnail.setContentType(detectedMimeType);

            try {

                thumbnail.setThumbnailData(file.getBytes());

            } catch (IOException exception) {

                log.error(
                        "Failed to read thumbnail file for itinerary {}",
                        itineraryId,
                        exception
                );

                throw new InvalidOperationException(
                        "Unable to process thumbnail file."
                );
            }

            thumbnail.setItinerary(itinerary);


            thumbnailRepository.save(thumbnail);


            log.info(
                    "Thumbnail uploaded for itinerary {}",
                    itineraryId
            );
        }
    }


    public Thumbnail getThumbnailByItineraryId(UUID itineraryId) {

        return thumbnailRepository.findByItineraryItineraryId(itineraryId)
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

}