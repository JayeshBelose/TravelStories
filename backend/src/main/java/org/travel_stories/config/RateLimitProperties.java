package org.travel_stories.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    @Valid
    private EndpointLimit login = new EndpointLimit();

    @Valid
    private EndpointLimit signup = new EndpointLimit();

    @Valid
    private EndpointLimit refresh = new EndpointLimit();

    @Valid
    private EndpointLimit forgotPassword = new EndpointLimit();

    @Valid
    private EndpointLimit resetPassword = new EndpointLimit();

    @Valid
    private EndpointLimit upload = new EndpointLimit();

    @Getter
    @Setter
    public static class EndpointLimit {

        @Min(1)
        private long capacity;

        @Min(1)
        private long refillTokens;

        /**
         * Refill interval in minutes.
         */
        @Min(1)
        private long refillDurationMinutes;
    }
}