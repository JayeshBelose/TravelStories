package org.travel_stories.repository.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.itinerary.ItineraryType;

public interface ItineraryTypeRepository extends JpaRepository<ItineraryType, Long> {

    ItineraryType findByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
