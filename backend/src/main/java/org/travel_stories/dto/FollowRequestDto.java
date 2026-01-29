package org.travel_stories.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class FollowRequestDto {

    private UUID followerId;
    private UUID followingId;

}
