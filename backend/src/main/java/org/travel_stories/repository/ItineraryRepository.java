package org.travel_stories.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.travel_stories.entity.Itinerary;

import java.time.LocalDate;
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
            WHERE i.isPublic = true
            """)
    List<Itinerary> findAllPublicWithRelations();

    List<Itinerary> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(i) FROM Itinerary i WHERE DATE(i.createdAt) = :date")
    long countByCreatedAt(@Param("date") LocalDate date);

    @Query("""
            SELECT i FROM Itinerary i
            WHERE
            (
                :search IS NULL OR :search = '' OR
                LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(i.place) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(i.createdBy.username) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            AND
            (
                :filter = 'ALL' OR
                (:filter = 'PUBLIC' AND i.isPublic = true) OR
                (:filter = 'PRIVATE' AND i.isPublic = false)
            )
            AND
            (
                :type = 'all' OR LOWER(i.type.name) = LOWER(:type)
            )
            """)
    Page<Itinerary> searchItinerariesAdmin(
            @Param("search") String search,
            @Param("filter") String filter,
            @Param("type") String type,
            Pageable pageable
    );

    @Query("""
            SELECT i FROM Itinerary i
            WHERE i.isPublic = true
            AND (
                LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(i.place) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            AND (:type = 'all' OR LOWER(i.type.name) = LOWER(:type))
            """)
    Page<Itinerary> searchItineraries(
            @Param("search") String search,
            @Param("type") String type,
            Pageable pageable
    );

}
