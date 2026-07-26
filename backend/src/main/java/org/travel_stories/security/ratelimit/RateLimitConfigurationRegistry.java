package org.travel_stories.security.ratelimit;

import org.springframework.stereotype.Component;
import org.travel_stories.config.RateLimitProperties;

import java.util.EnumMap;
import java.util.Map;

@Component
public class RateLimitConfigurationRegistry {

    private final Map<EndpointCategory, RateLimitProperties.EndpointLimit> limits;

    public RateLimitConfigurationRegistry(RateLimitProperties properties) {

        EnumMap<EndpointCategory, RateLimitProperties.EndpointLimit> map =
                new EnumMap<>(EndpointCategory.class);

        map.put(EndpointCategory.LOGIN, properties.getLogin());
        map.put(EndpointCategory.SIGNUP, properties.getSignup());
        map.put(EndpointCategory.REFRESH, properties.getRefresh());
        map.put(EndpointCategory.FORGOT_PASSWORD, properties.getForgotPassword());
        map.put(EndpointCategory.RESET_PASSWORD, properties.getResetPassword());
        map.put(EndpointCategory.UPLOAD, properties.getUpload());

        this.limits = Map.copyOf(map);
    }

    public RateLimitProperties.EndpointLimit getLimit(
            EndpointCategory category
    ) {
        return limits.get(category);
    }
}