package org.travel_stories.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ItineraryRequestDto {

    private String place;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isPublic;
    private String type;

}
