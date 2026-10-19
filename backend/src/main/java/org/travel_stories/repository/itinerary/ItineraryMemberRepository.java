package org.travel_stories.repository.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.itinerary.ItineraryMember;

import java.util.UUID;

public interface ItineraryMemberRepository extends JpaRepository<ItineraryMember, Long> {

    void deleteByItineraryItineraryIdAndUserUserId(UUID itineraryId, UUID userId);

    boolean existsByItineraryItineraryIdAndUserUserId(UUID itineraryId, UUID userId);

}
