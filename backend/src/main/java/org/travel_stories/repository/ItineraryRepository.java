package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.travel_stories.entity.Itinerary;

import java.util.List;
import java.util.UUID;

public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {

    List<Itinerary> findAllByTypeTypeId(Long typeId);

    List<Itinerary> findAllByCreatedByUserId(UUID userId);

    List<Itinerary> findAllByMembersUserUserId(UUID userId);

    List<Itinerary> findAllBySavedByUserUserId(UUID userId);

    @Query("""
           SELECT l.itinerary
           FROM LikedItinerary l
           GROUP BY l.itinerary
           ORDER BY COUNT(l) DESC
           """)
    List<Itinerary> findMostLikedItineraries();

    @Query("""
           SELECT s.itinerary
           FROM SavedItinerary s
           GROUP BY s.itinerary
           ORDER BY COUNT(s) DESC
           """)
    List<Itinerary> findMostSavedItineraries();

    @Query("""
            SELECT DISTINCT i FROM Itinerary i
            LEFT JOIN FETCH i.createdBy
            LEFT JOIN FETCH i.type
            LEFT JOIN FETCH i.members m
            LEFT JOIN FETCH m.user
            """)
    List<Itinerary> findAllWithRelations();

}
