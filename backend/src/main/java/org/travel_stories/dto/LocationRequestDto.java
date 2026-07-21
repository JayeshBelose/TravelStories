package org.travel_stories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationRequestDto {

    @NotBlank(message = "Location name is required.")
    @Size(max = 100, message = "Location name cannot exceed 100 characters.")
    private String locationName;

    @NotBlank(message = "Location address is required.")
    @Size(max = 255, message = "Location address cannot exceed 255 characters.")
    private String locationAddress;

}
