package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeeklyActivityDto {
    private String date;
    private long newUsers;
    private long newItineraries;
}