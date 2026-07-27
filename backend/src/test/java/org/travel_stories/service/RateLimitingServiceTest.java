package org.travel_stories.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.travel_stories.config.RateLimitProperties;
import org.travel_stories.exception.RateLimitExceededException;
import org.travel_stories.security.ratelimit.BucketKey;
import org.travel_stories.security.ratelimit.EndpointCategory;
import org.travel_stories.security.ratelimit.RateLimitConfigurationRegistry;

import java.time.Duration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitingServiceTest {

    private Cache<BucketKey, Bucket> cache;

    private RateLimitConfigurationRegistry registry;

    private RateLimitingService service;

    @BeforeEach
    void setUp() {

        cache = Caffeine.newBuilder()
                .maximumSize(100)
                .build();

        registry = mock(RateLimitConfigurationRegistry.class);

        RateLimitProperties.EndpointLimit loginLimit =
                new RateLimitProperties.EndpointLimit();

        loginLimit.setCapacity(5);
        loginLimit.setRefillTokens(5);
        loginLimit.setRefillPeriod(Duration.ofMinutes(1));

        when(registry.getLimit(EndpointCategory.LOGIN))
                .thenReturn(loginLimit);

        service = new RateLimitingService(
                cache,
                registry
        );
    }

    @Test
    @DisplayName("Should allow requests within configured capacity")
    void shouldAllowRequestsWithinCapacity() {

        BucketKey key = new BucketKey(
                "ip:127.0.0.1",
                EndpointCategory.LOGIN
        );

        assertThatCode(() -> {

            for (int i = 0; i < 5; i++) {
                service.validateRateLimit(key);
            }

        }).doesNotThrowAnyException();

        verify(registry, times(1))
                .getLimit(EndpointCategory.LOGIN);

        assertThat(cache.estimatedSize())
                .isEqualTo(1);
    }

    @Test
    @DisplayName("Should reject request when bucket capacity is exhausted")
    void shouldRejectRequestWhenCapacityExceeded() {

        BucketKey key = new BucketKey(
                "ip:127.0.0.1",
                EndpointCategory.LOGIN
        );

        for (int i = 0; i < 5; i++) {
            service.validateRateLimit(key);
        }

        RateLimitExceededException exception =
                catchThrowableOfType(
                        () -> service.validateRateLimit(key),
                        RateLimitExceededException.class
                );

        assertThat(exception).isNotNull();

        assertThat(exception.getRetryAfterSeconds())
                .isBetween(1L, 60L);

        verify(registry, times(1))
                .getLimit(EndpointCategory.LOGIN);

        assertThat(cache.estimatedSize())
                .isEqualTo(1);
    }

    @Test
    @DisplayName("Should reuse cached bucket for identical key")
    void shouldReuseBucketForSameKey() {

        BucketKey key = new BucketKey(
                "ip:192.168.1.10",
                EndpointCategory.LOGIN
        );

        service.validateRateLimit(key);

        Bucket first = cache.getIfPresent(key);

        service.validateRateLimit(key);

        Bucket second = cache.getIfPresent(key);

        assertThat(first)
                .isNotNull();

        assertThat(second)
                .isSameAs(first);

        verify(registry, times(1))
                .getLimit(EndpointCategory.LOGIN);

        assertThat(cache.estimatedSize())
                .isEqualTo(1);
    }

    @Test
    @DisplayName("Should create separate buckets for different clients")
    void shouldCreateDifferentBucketsForDifferentClients() {

        BucketKey first =
                new BucketKey(
                        "ip:1.1.1.1",
                        EndpointCategory.LOGIN
                );

        BucketKey second =
                new BucketKey(
                        "ip:2.2.2.2",
                        EndpointCategory.LOGIN
                );

        service.validateRateLimit(first);
        service.validateRateLimit(second);

        assertThat(cache.getIfPresent(first))
                .isNotSameAs(cache.getIfPresent(second));

        assertThat(cache.estimatedSize())
                .isEqualTo(2);

        verify(registry, times(2))
                .getLimit(EndpointCategory.LOGIN);
    }

    @Test
    @DisplayName("Should create separate buckets for different endpoint categories")
    void shouldCreateDifferentBucketsForDifferentCategories() {

        RateLimitProperties.EndpointLimit uploadLimit =
                new RateLimitProperties.EndpointLimit();

        uploadLimit.setCapacity(20);
        uploadLimit.setRefillTokens(20);
        uploadLimit.setRefillPeriod(Duration.ofHours(1));

        when(registry.getLimit(EndpointCategory.UPLOAD))
                .thenReturn(uploadLimit);

        BucketKey login =
                new BucketKey(
                        "ip:127.0.0.1",
                        EndpointCategory.LOGIN
                );

        BucketKey upload =
                new BucketKey(
                        "ip:127.0.0.1",
                        EndpointCategory.UPLOAD
                );

        service.validateRateLimit(login);
        service.validateRateLimit(upload);

        assertThat(cache.getIfPresent(login))
                .isNotSameAs(cache.getIfPresent(upload));

        assertThat(cache.estimatedSize())
                .isEqualTo(2);

        verify(registry).getLimit(EndpointCategory.LOGIN);
        verify(registry).getLimit(EndpointCategory.UPLOAD);
    }

    @Test
    @DisplayName("Should create one cached bucket per unique key")
    void shouldCreateOneBucketPerUniqueKey() {

        for (int i = 0; i < 10; i++) {

            service.validateRateLimit(
                    new BucketKey(
                            "ip:" + i,
                            EndpointCategory.LOGIN
                    )
            );
        }

        assertThat(cache.estimatedSize())
                .isEqualTo(10);

        verify(registry, times(10))
                .getLimit(EndpointCategory.LOGIN);
    }

    @Test
    @DisplayName("Should fail when endpoint configuration is missing")
    void shouldThrowWhenConfigurationMissing() {

        when(registry.getLimit(EndpointCategory.REFRESH))
                .thenReturn(null);

        BucketKey key =
                new BucketKey(
                        "ip:127.0.0.1",
                        EndpointCategory.REFRESH
                );

        Throwable thrown =
                catchThrowable(() ->
                        service.validateRateLimit(key)
                );

        assertThat(thrown)
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Missing rate limit configuration");

        verify(registry)
                .getLimit(EndpointCategory.REFRESH);
    }
}