package org.travel_stories.dto;

import lombok.Data;
import org.travel_stories.entity.ItineraryMember;
import org.travel_stories.entity.ProfilePicture;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class UserResponseDto {

    private UUID userId;
    private String username;
    private String email;
    private ProfilePicture profilePicture;
    private String bio;
    private Instant createdAt;
    private Integer followersCount;
    private Integer followingCount;

}