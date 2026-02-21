package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.Thumbnail;

import java.util.Optional;
import java.util.UUID;

public interface ThumbnailRepository extends JpaRepository<Thumbnail, UUID> {

    Optional<Thumbnail> findByItineraryItineraryId(UUID itineraryId);

}
