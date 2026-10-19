package org.travel_stories.repository.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.itinerary.Thumbnail;

import java.util.Optional;
import java.util.UUID;

public interface ThumbnailRepository extends JpaRepository<Thumbnail, UUID> {

    Optional<Thumbnail> findByItineraryItineraryId(UUID itineraryId);

}
