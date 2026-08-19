package org.travel_stories.service.storage;

import lombok.Getter;

@Getter
public enum FileStorageCategory {

    IMAGE("images"),
    THUMBNAIL("thumbnails"),
    PROFILE_PICTURE("profile-pictures");

    private final String directoryName;

    FileStorageCategory(String directoryName) {
        this.directoryName = directoryName;
    }

}