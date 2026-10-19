package org.travel_stories.dto.user.social.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class FollowResponseDto {

    private UUID userId;

    private String username;

}
