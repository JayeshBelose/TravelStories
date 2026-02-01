package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.travel_stories.entity.Day;

import java.util.List;
import java.util.UUID;

public interface DayRepository extends JpaRepository<Day, UUID> {

    int countByItineraryItineraryId(UUID itineraryId);

    List<Day> findByItineraryItineraryIdOrderByDayNumber(UUID itineraryId);

    @Query("""
        SELECT COALESCE(MAX(d.dayNumber), 0)
        FROM Day d
        WHERE d.itinerary.itineraryId = :itineraryId
    """)
    int findMaxDayNumber(UUID itineraryId);

}
