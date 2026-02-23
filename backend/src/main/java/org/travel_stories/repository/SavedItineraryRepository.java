package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.SavedItinerary;

import java.util.UUID;

public interface SavedItineraryRepository extends JpaRepository<SavedItinerary, UUID> {

    void deleteByUserUserIdAndItineraryItineraryId(UUID userId, UUID itineraryId);

    void deleteByUserUserId(UUID userId);

    void deleteByItineraryItineraryId(UUID itineraryId);

    Boolean existsByUserUserIdAndItineraryItineraryId(UUID userId, UUID itineraryId);

    Integer countByItineraryItineraryId(UUID itineraryId);

}
