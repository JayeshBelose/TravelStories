package org.travel_stories.dto.itinerary.response;

import lombok.Data;

import java.util.UUID;

@Data
public class MemberResponseDto {

    private UUID userId;

    private String username;

}
