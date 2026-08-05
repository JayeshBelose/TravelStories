package org.travel_stories.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;

    private String message;

    private T data;

    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                true,
                message,
                data,
                LocalDateTime.now()
        );
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(
                true,
                message,
                null,
                LocalDateTime.now()
        );
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(
                false,
                message,
                null,
                LocalDateTime.now()
        );
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(
                false,
                message,
                data,
                LocalDateTime.now()
        );
    }

}
