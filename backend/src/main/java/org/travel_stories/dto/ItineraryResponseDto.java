package org.travel_stories.dto;

import lombok.Data;
import org.travel_stories.entity.Day;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ItineraryResponseDto {

    private UUID itineraryId;
    private String place;
    private String title;
    private String thumbnailUrl;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalDays;
    private Boolean isPublic;
    private Integer likeCount;
    private Integer saveCount;
    private Instant createdAt;
    private Instant lasUpdated;
    private UUID createdBy;
    private String type;
    private List<DayResponseDto> days;
    private List<UUID> members;

}
