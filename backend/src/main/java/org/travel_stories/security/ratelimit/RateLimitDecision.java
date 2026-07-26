package org.travel_stories.security.ratelimit;

public record RateLimitDecision(

        boolean allowed,

        long remainingTokens,

        long retryAfterSeconds

) {
}