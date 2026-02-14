package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageResponseDto {

    private UUID imageId;
    private String imageUrl;

}
