package org.travel_stories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ItineraryTypeDto {

    private Long typeId;

    @NotBlank(message = "Type name is required.")
    @Size(max = 50, message = "Type name cannot exceed 50 characters.")
    private String name;

}
