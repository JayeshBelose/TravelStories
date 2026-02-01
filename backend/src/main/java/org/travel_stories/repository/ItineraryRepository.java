package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.Itinerary;

import java.util.List;
import java.util.UUID;

public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {

    List<Itinerary> findAllByTypeTypeId(Long typeId);

}
