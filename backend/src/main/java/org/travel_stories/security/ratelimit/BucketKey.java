package org.travel_stories.security.ratelimit;

public record BucketKey(
        String clientIp,
        EndpointCategory category
) {
}