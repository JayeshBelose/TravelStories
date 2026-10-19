package org.travel_stories.dto.itinerary.image.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageResponseDto {

    private UUID imageId;

    private String contentType;

    private Integer orderNumber;
}
