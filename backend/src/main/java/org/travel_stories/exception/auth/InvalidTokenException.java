package org.travel_stories.exception.auth;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String mesasge) {
        super(mesasge);
    }

}
