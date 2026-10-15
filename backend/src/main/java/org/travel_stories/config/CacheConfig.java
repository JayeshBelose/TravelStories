package org.travel_stories.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String ITINERARY_TYPES_CACHE = "itineraryTypes";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager(
                        ITINERARY_TYPES_CACHE
                );

        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(1)
                        .expireAfterWrite(Duration.ofMinutes(30))
        );

        return cacheManager;
    }
}