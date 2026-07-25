package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthTokenResponseDto {

    private String accessToken;

    private String refreshToken;

    private Long expiresIn;

}
