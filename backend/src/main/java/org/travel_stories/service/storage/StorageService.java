package org.travel_stories.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String store(
            MultipartFile file,
            FileStorageCategory category
    );

    Resource load(String storageKey);

    void delete(String storageKey);

    boolean exists(String storageKey);

    long getLastModified(String storageKey);
}