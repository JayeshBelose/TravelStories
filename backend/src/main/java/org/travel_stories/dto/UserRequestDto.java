package org.travel_stories.dto;

import lombok.Data;

@Data
public class UserRequestDto {

    private String username;
    private String email;
    private String password;
    private String bio;

}
