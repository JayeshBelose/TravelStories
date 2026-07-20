package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.ItineraryType;

public interface ItineraryTypeRepository extends JpaRepository<ItineraryType, Long> {

    ItineraryType findByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
