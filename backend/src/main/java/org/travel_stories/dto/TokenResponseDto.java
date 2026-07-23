package org.travel_stories.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResponseDto {

    private String accessToken;

    private String refreshToken;

    private Long expiresIn;

}
