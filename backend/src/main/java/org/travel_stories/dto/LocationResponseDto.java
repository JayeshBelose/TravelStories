package org.travel_stories.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class LocationResponseDto {

    private UUID locationId;
    private Integer locationNumber;
    private String locationName;
    private String locationAddress;

}
