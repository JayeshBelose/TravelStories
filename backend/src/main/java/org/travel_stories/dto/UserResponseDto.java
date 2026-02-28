package org.travel_stories.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class UserResponseDto {

    private UUID userId;
    private String username;
    private String email;
    private String bio;
    private Instant createdAt;
    private Integer followersCount;
    private Integer followingCount;

}