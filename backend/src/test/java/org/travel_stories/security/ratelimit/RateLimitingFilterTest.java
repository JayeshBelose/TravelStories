package org.travel_stories.security.ratelimit;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.travel_stories.exception.RateLimitExceededException;
import org.travel_stories.service.RateLimitingService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitingFilterTest {

    private RateLimitingService rateLimitingService;

    private HandlerExceptionResolver handlerExceptionResolver;

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {

        rateLimitingService = mock(RateLimitingService.class);
        handlerExceptionResolver = mock(HandlerExceptionResolver.class);

        filter = new RateLimitingFilter(rateLimitingService, handlerExceptionResolver);
    }

    @Test
    void shouldRateLimitLoginEndpoint() throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/auth/login"
                );

        request.setRemoteAddr("127.0.0.1");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                chain
        );

        verify(rateLimitingService)
                .validateRateLimit(any(BucketKey.class));

        verify(chain)
                .doFilter(request, response);
    }

    @Test
    void shouldIgnoreGetRequests() throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "GET",
                        "/api/auth/login"
                );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                chain
        );

        verifyNoInteractions(rateLimitingService);

        verify(chain)
                .doFilter(request, response);
    }

    @Test
    void shouldIgnoreUnknownEndpoint() throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/test"
                );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                chain
        );

        verifyNoInteractions(rateLimitingService);

        verify(chain)
                .doFilter(request, response);
    }

    @Test
    void shouldPropagateRateLimitException() {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/auth/login"
                );

        request.setRemoteAddr("127.0.0.1");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        doThrow(new RateLimitExceededException(30))
                .when(rateLimitingService)
                .validateRateLimit(any(BucketKey.class));

        assertThrows(
                RateLimitExceededException.class,
                () -> filter.doFilter(
                        request,
                        response,
                        chain
                )
        );
    }

    @Test
    void shouldUseForwardedIpHeader() throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/auth/login"
                );

        request.addHeader(
                "X-Forwarded-For",
                "1.2.3.4"
        );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                chain
        );

        verify(rateLimitingService)
                .validateRateLimit(
                        argThat(key ->
                                key.identifier().equals("ip:1.2.3.4")
                                        && key.category() == EndpointCategory.LOGIN
                        )
                );
    }

    @Test
    void shouldRateLimitUploadEndpoint() throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/users/5/profilePicture"
                );

        request.setRemoteAddr("127.0.0.1");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain chain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                chain
        );

        verify(rateLimitingService)
                .validateRateLimit(
                        argThat(key ->
                                key.category() == EndpointCategory.UPLOAD
                        )
                );
    }
}