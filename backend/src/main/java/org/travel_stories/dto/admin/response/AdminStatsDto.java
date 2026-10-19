package org.travel_stories.dto.admin.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsDto {

    private long users;

    private long itineraries;

    private long images;

}