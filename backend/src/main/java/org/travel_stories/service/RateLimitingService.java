package org.travel_stories.service;

import com.github.benmanes.caffeine.cache.Cache;
import io.github.bucket4j.BandwidthBuilder;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.travel_stories.config.RateLimitProperties;
import org.travel_stories.exception.RateLimitExceededException;
import org.travel_stories.security.ratelimit.BucketKey;
import org.travel_stories.security.ratelimit.RateLimitConfigurationRegistry;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Service
public class RateLimitingService {

    private static final Logger log =
            LoggerFactory.getLogger(RateLimitingService.class);

    private final Cache<BucketKey, Bucket> cache;

    private final RateLimitConfigurationRegistry configurationRegistry;

    public RateLimitingService(
            Cache<BucketKey, Bucket> cache,
            RateLimitConfigurationRegistry configurationRegistry
    ) {
        this.cache = cache;
        this.configurationRegistry = configurationRegistry;
    }

    public void validateRateLimit(BucketKey bucketKey) {

        Bucket bucket = cache.get(
                bucketKey,
                this::createBucket
        );

        ConsumptionProbe probe =
                bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {

            log.debug(
                    "Rate limit passed. Client={}, Category={}, RemainingTokens={}",
                    bucketKey.identifier(),
                    bucketKey.category(),
                    probe.getRemainingTokens()
            );

            return;
        }

        long retryAfterSeconds =
                Math.max(
                        1,
                        TimeUnit.NANOSECONDS.toSeconds(
                                probe.getNanosToWaitForRefill()
                        )
                );

        log.warn(
                "Rate limit exceeded. Client={}, Category={}, RetryAfter={}s",
                bucketKey.identifier(),
                bucketKey.category(),
                retryAfterSeconds
        );

        throw new RateLimitExceededException(
                retryAfterSeconds
        );
    }

    private Bucket createBucket(BucketKey bucketKey) {

        RateLimitProperties.EndpointLimit configuration =
                Objects.requireNonNull(
                        configurationRegistry.getLimit(bucketKey.category()),
                        "Missing rate limit configuration for " + bucketKey.category()
                );

        return Bucket.builder()
                .addLimit(limit -> limit
                        .capacity(configuration.getCapacity())
                        .refillGreedy(
                                configuration.getRefillTokens(),
                                configuration.getRefillPeriod()
                        )
                )
                .build();
    }

}