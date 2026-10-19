package org.travel_stories.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PasswordResetOtpResponseDto {

    private int attemptsRemaining;

}
