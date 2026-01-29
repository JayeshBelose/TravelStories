package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.ItineraryType;

public interface ItineraryTypeRepository extends JpaRepository<ItineraryType, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM ItineraryType t WHERE t.name = :name")
    void deleteByName(String name);

}
