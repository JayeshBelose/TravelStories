package org.travel_stories.security.ratelimit;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.travel_stories.service.RateLimitingService;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;

    private static final Map<String, EndpointCategory> RATE_LIMITED_ENDPOINTS =
            Map.of(
                    "/api/auth/login", EndpointCategory.LOGIN,
                    "/api/auth/signup", EndpointCategory.SIGNUP,
                    "/api/auth/refresh", EndpointCategory.REFRESH,
                    "/api/auth/forgotPassword", EndpointCategory.FORGOT_PASSWORD,
                    "/api/auth/resetPassword", EndpointCategory.RESET_PASSWORD
            );

    public RateLimitingFilter(
            RateLimitingService rateLimitingService
    ) {
        this.rateLimitingService = rateLimitingService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        EndpointCategory category =
                RATE_LIMITED_ENDPOINTS.get(request.getRequestURI());

        String clientIp = extractClientIp(request);

        BucketKey bucketKey = new BucketKey(
                "ip:" + clientIp,
                category
        );

        log.debug(
                "Applying rate limit [{}] for [{}]",
                category,
                clientIp
        );

        rateLimitingService.validateRateLimit(bucketKey);

        filterChain.doFilter(request, response);
    }

    private EndpointCategory resolveCategory(HttpServletRequest request) {

        if (!HttpMethod.POST.matches(request.getMethod())) {
            return null;
        }

        return RATE_LIMITED_ENDPOINTS.get(request.getRequestURI());
    }

    private String extractClientIp(HttpServletRequest request) {

        String[] headers = {
                "CF-Connecting-IP",
                "X-Forwarded-For",
                "X-Real-IP"
        };

        for (String header : headers) {

            String value = request.getHeader(header);

            if (value != null &&
                    !value.isBlank() &&
                    !"unknown".equalsIgnoreCase(value)) {

                return value.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        if (request.getDispatcherType() == DispatcherType.ERROR) {
            return true;
        }

        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        return !RATE_LIMITED_ENDPOINTS.containsKey(request.getRequestURI());
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }

}