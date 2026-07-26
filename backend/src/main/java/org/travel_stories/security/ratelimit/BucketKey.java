package org.travel_stories.security.ratelimit;

import java.util.Objects;

public record BucketKey(

        String identifier,

        EndpointCategory category

) {

    public BucketKey {

        Objects.requireNonNull(identifier, "identifier cannot be null");
        Objects.requireNonNull(category, "category cannot be null");

        if (identifier.isBlank()) {
            throw new IllegalArgumentException("identifier cannot be blank");
        }
    }
}