package org.travel_stories.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ItineraryResponseDto {

    private String place;
    private String title;
    private String thumbnailUrl;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private Boolean isPublic;
    private Integer likeCount;
    private Integer saveCount;
    private Instant createdAt;
    private Instant lasUpdated;
    private String createdBy;
    private String type;

}
