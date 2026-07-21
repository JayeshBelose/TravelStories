package org.travel_stories.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class FollowRequestDto {

    @NotNull(message = "Follower ID is required.")
    private UUID followerId;

    @NotNull(message = "Following ID is required.")
    private UUID followingId;

}
