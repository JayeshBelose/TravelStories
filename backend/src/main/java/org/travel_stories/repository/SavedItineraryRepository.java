package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.SavedItinerary;

import java.util.UUID;

public interface SavedItineraryRepository extends JpaRepository<SavedItinerary, Long> {

    void deleteByUserUserIdAndItineraryItineraryId(UUID userId, UUID itineraryId);

}
