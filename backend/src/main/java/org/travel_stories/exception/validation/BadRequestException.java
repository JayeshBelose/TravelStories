package org.travel_stories.exception.validation;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

}