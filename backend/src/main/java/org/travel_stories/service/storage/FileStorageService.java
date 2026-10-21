package org.travel_stories.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.resource.ResourceNotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(
        name = "app.storage.provider",
        havingValue = "local",
        matchIfMissing = true
)
public class FileStorageService implements StorageService {

    private final Path storagePath;

    public FileStorageService(
            @Value("${app.file-storage.path}")
            String storagePath
    ) {
        this.storagePath =
                Paths.get(storagePath)
                        .toAbsolutePath()
                        .normalize();

        initializeStorageDirectory();
    }

    @Override
    public String store(
            MultipartFile file,
            FileStorageCategory category
    ) {

        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot store an empty file."
            );
        }

        if (category == null) {
            throw new InvalidOperationException(
                    "File storage category is required."
            );
        }

        String extension =
                getExtension(file);

        String filename =
                UUID.randomUUID() + extension;

        Path categoryPath =
                storagePath
                        .resolve(category.getDirectoryName())
                        .normalize();

        Path targetPath =
                categoryPath
                        .resolve(filename)
                        .normalize();

        validatePathInsideStorage(targetPath);

        try {

            Files.createDirectories(categoryPath);

            try (InputStream inputStream =
                         file.getInputStream()) {

                Files.copy(
                        inputStream,
                        targetPath
                );
            }

            String relativePath =
                    storagePath
                            .relativize(targetPath)
                            .toString()
                            .replace('\\', '/');

            log.info(
                    "File stored successfully. category={}, path={}",
                    category,
                    relativePath
            );

            return relativePath;

        } catch (IOException exception) {

            log.error(
                    "Failed to store file. category={}",
                    category,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to store uploaded file."
            );
        }
    }

    @Override
    public Resource load(String relativePath) {

        Path filePath =
                resolveStoredPath(relativePath);

        if (!Files.exists(filePath)) {

            log.warn(
                    "Stored file not found: {}",
                    relativePath
            );

            throw new InvalidOperationException(
                    "Stored file could not be found."
            );
        }

        if (!Files.isRegularFile(filePath)) {

            log.warn(
                    "Stored path is not a regular file: {}",
                    relativePath
            );

            throw new InvalidOperationException(
                    "Stored file is invalid."
            );
        }

        try {

            Resource resource =
                    new UrlResource(
                            filePath.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                log.warn(
                        "Stored file is not readable: {}",
                        relativePath
                );

                throw new InvalidOperationException(
                        "Stored file could not be read."
                );
            }

            return resource;

        } catch (MalformedURLException exception) {

            log.error(
                    "Failed to create resource for stored file: {}",
                    relativePath,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to load stored file."
            );
        }
    }

    @Override
    public void delete(String relativePath) {

        if (relativePath == null
                || relativePath.isBlank()) {

            return;
        }

        Path filePath =
                resolveStoredPath(relativePath);

        try {

            boolean deleted =
                    Files.deleteIfExists(filePath);

            if (deleted) {

                log.info(
                        "Stored file deleted: {}",
                        relativePath
                );

            } else {

                log.debug(
                        "Stored file did not exist: {}",
                        relativePath
                );
            }

        } catch (IOException exception) {

            log.error(
                    "Failed to delete stored file: {}",
                    relativePath,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to delete stored file."
            );
        }
    }

    @Override
    public boolean exists(String relativePath) {

        if (relativePath == null
                || relativePath.isBlank()) {

            return false;
        }

        Path filePath =
                resolveStoredPath(relativePath);

        return Files.exists(filePath)
                && Files.isRegularFile(filePath);
    }

    @Override
    public long getLastModified(String relativePath) {

        Path filePath =
                resolveStoredPath(relativePath);

        try {

            if (!Files.exists(filePath)
                    || !Files.isRegularFile(filePath)) {

                throw new ResourceNotFoundException(
                        "Stored file not found."
                );
            }

            return Files.getLastModifiedTime(
                    filePath
            ).toMillis();

        } catch (IOException exception) {

            throw new InvalidOperationException(
                    "Failed to read file metadata."
            );
        }
    }

    private Path resolveStoredPath(
            String relativePath
    ) {

        if (relativePath == null
                || relativePath.isBlank()) {

            throw new InvalidOperationException(
                    "File path is required."
            );
        }

        Path resolvedPath =
                storagePath
                        .resolve(relativePath)
                        .normalize();

        validatePathInsideStorage(
                resolvedPath
        );

        return resolvedPath;
    }

    private void validatePathInsideStorage(
            Path path
    ) {

        Path normalizedPath =
                path.toAbsolutePath()
                        .normalize();

        Path normalizedStoragePath =
                storagePath
                        .toAbsolutePath()
                        .normalize();

        if (!normalizedPath.startsWith(
                normalizedStoragePath
        )) {

            log.warn(
                    "Rejected file path outside storage directory: {}",
                    path
            );

            throw new InvalidOperationException(
                    "Invalid file storage path."
            );
        }
    }

    private String getExtension(
            MultipartFile file
    ) {

        String originalFilename =
                file.getOriginalFilename();

        if (originalFilename == null
                || originalFilename.isBlank()) {

            throw new InvalidOperationException(
                    "Uploaded file must have a valid filename."
            );
        }

        String filename =
                Paths.get(originalFilename)
                        .getFileName()
                        .toString();

        int extensionIndex =
                filename.lastIndexOf('.');

        if (extensionIndex < 0
                || extensionIndex == filename.length() - 1) {

            throw new InvalidOperationException(
                    "Uploaded file must have a valid extension."
            );
        }

        return filename
                .substring(extensionIndex)
                .toLowerCase();
    }

    private void initializeStorageDirectory() {

        try {

            Files.createDirectories(
                    storagePath
            );

            log.info(
                    "File storage initialized at: {}",
                    storagePath
            );

        } catch (IOException exception) {

            log.error(
                    "Failed to initialize file storage at: {}",
                    storagePath,
                    exception
            );

            throw new IllegalStateException(
                    "Failed to initialize file storage.",
                    exception
            );
        }
    }
}