package org.travel_stories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItineraryRequestDto {

    @NotBlank(message = "Place is required.")
    @Size(max = 100, message = "Place cannot exceed 100 characters.")
    private String place;

    @NotBlank(message = "Title is required.")
    @Size(max = 100, message = "Title cannot exceed 100 characters.")
    private String title;

    @Size(max = 5000, message = "Description cannot exceed 5000 characters.")
    private String description;

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "End date is required.")
    private LocalDate endDate;

    private boolean isPublic;

    @NotBlank(message = "Itinerary type is required.")
    private String type;

}
