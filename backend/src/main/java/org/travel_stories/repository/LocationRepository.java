package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.travel_stories.entity.Location;

import java.util.List;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {

    @Query("""
        SELECT COALESCE(MAX(l.locationNumber), 0)
        FROM Location l
        WHERE l.day.dayId = :dayId
    """)
    int findNextLocationNumber(UUID dayId);

    List<Location> findByDayDayIdOrderByLocationNumber(UUID dayId);

}
