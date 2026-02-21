package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.entity.Thumbnail;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.ThumbnailRepository;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ThumbnailService {

    private final ThumbnailRepository thumbnailRepository;
    private final ItineraryRepository itineraryRepository;

    public void uploadOrUpdate(UUID itineraryId, MultipartFile file) throws IOException {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                        .orElseThrow(() -> new RuntimeException("Itinerary not found."));

        thumbnailRepository.findByItineraryItineraryId(itineraryId)
                .ifPresent(tn -> {
                    try {
                        tn.setThumbnailData(file.getBytes());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    tn.setContentType(file.getContentType());
                });

        if (thumbnailRepository.findByItineraryItineraryId(itineraryId).isEmpty()){
            Thumbnail thumbnail = new Thumbnail();
            thumbnail.setContentType(file.getContentType());
            thumbnail.setThumbnailData(file.getBytes());
            thumbnail.setItinerary(itinerary);
            thumbnailRepository.save(thumbnail);
        }
    }

    public Thumbnail getThumbnailByItineraryId(UUID itineraryId){
        return thumbnailRepository.findByItineraryItineraryId(itineraryId)
                .orElseThrow(() -> new RuntimeException("Thumbnail not found."));
    }

}
