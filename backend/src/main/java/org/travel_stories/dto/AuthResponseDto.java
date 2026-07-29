package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponseDto {

    private UUID userId;

    private String username;

    private String role;

}