package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.travel_stories.entity.Image;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageResponseDto {

    private UUID imageId;

    private String contentType;

    private Integer orderNumber;
}
