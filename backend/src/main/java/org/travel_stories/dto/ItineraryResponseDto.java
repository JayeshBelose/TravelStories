package org.travel_stories.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ItineraryResponseDto {

    private UUID itineraryId;

    private String place;

    private String title;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long totalDays;

    private boolean isPublic;

    private Integer likeCount;

    private Integer saveCount;

    private Instant createdAt;

    private Instant lastUpdated;

    private String createdBy;

    private String type;

    private List<MemberResponseDto> members;

}
