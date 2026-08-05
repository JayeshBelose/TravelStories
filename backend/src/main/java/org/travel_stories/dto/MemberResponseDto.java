package org.travel_stories.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class MemberResponseDto {

    private UUID userId;

    private String username;

}
