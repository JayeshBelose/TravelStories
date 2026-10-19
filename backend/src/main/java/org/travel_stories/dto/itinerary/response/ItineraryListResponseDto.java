package org.travel_stories.dto.itinerary.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ItineraryListResponseDto {

    private UUID itineraryId;

    private String place;

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean isPublic;

    private Integer likeCount;

    private Integer saveCount;

    private String createdBy;

    private String type;
}