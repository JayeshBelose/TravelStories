package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.travel_stories.entity.Image;

import java.util.List;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {

    List<Image> findByLocationLocationIdOrderByOrderNumber(UUID locationId);

    @Query("""
                SELECT COALESCE(MAX(i.orderNumber), 0)
                FROM Image i
                WHERE i.location.locationId = :locationId
            """)
    int findNextOrderNumber(UUID locationId);

    @Query("""
        SELECT i
        FROM Image i
        JOIN i.location l
        JOIN l.day d
        WHERE d.itinerary.itineraryId = :itineraryId
        ORDER BY l.locationId, i.orderNumber
       """)
    List<Image> findByItineraryId(UUID itineraryId);

}
