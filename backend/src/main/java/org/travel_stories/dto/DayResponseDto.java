package org.travel_stories.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DayResponseDto {

    private UUID dayId;

    private Integer dayNumber;

    private String description;

}
