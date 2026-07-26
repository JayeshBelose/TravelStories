package org.travel_stories.security.ratelimit;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.travel_stories.service.RateLimitingService;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;

    private static final String LOGIN = "/api/auth/login";
    private static final String SIGNUP = "/api/auth/signup";
    private static final String REFRESH = "/api/auth/refresh";
    private static final String FORGOT_PASSWORD = "/api/auth/forgotPassword";
    private static final String RESET_PASSWORD = "/api/auth/resetPassword";

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
        if (request.getDispatcherType() == DispatcherType.ERROR) {
            filterChain.doFilter(request, response);
            return;
        }

        EndpointCategory category = resolveCategory(request);

        if (category == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);

        BucketKey bucketKey = new BucketKey(
                "ip:" + clientIp,
                category
        );

        rateLimitingService.validateRateLimit(bucketKey);

        filterChain.doFilter(request, response);
    }

    private EndpointCategory resolveCategory(HttpServletRequest request) {

        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (!HttpMethod.POST.matches(method)) {
            return null;
        }

        return switch (uri) {

            case LOGIN -> EndpointCategory.LOGIN;

            case SIGNUP -> EndpointCategory.SIGNUP;

            case REFRESH -> EndpointCategory.REFRESH;

            case FORGOT_PASSWORD -> EndpointCategory.FORGOT_PASSWORD;

            case RESET_PASSWORD -> EndpointCategory.RESET_PASSWORD;

            default -> null;
        };
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

}