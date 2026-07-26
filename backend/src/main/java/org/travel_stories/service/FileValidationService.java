package org.travel_stories.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.exception.InvalidOperationException;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

@Service
@Slf4j
public class FileValidationService {

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp"
    );

    private final Tika tika = new Tika();

    /**
     * Validates the uploaded file by inspecting its actual content.
     *
     * @param file uploaded multipart file
     * @return verified MIME type
     * @throws InvalidOperationException if the file is empty,
     *                                   unreadable, or unsupported
     */
    public String validateMimeType(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            log.warn("Upload rejected: empty file");
            throw new InvalidOperationException("Uploaded file cannot be empty.");
        }

        validateExtension(file);

        try {

            String detectedType =
                    tika.detect(file.getInputStream());

            if (!ALLOWED_IMAGE_MIME_TYPES.contains(detectedType)) {

                log.warn("Upload rejected. Unsupported MIME type: {}", detectedType);

                throw new InvalidOperationException(
                        "Unsupported file type. Only JPEG, PNG and WebP images are allowed."
                );
            }

            log.debug(
                    "File validation successful. MIME type: {}",
                    detectedType
            );
            
            return detectedType;

        } catch (IOException ex) {

            log.error(
                    "Failed to inspect uploaded file while detecting MIME type.",
                    ex
            );

            throw new InvalidOperationException(
                    "Unable to validate uploaded file."
            );
        }

    }

    private void validateExtension(MultipartFile file) {

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {

            log.warn("Upload rejected: missing original filename");

            throw new InvalidOperationException(
                    "Uploaded file must have a valid filename."
            );
        }

        originalFilename = StringUtils.cleanPath(originalFilename);

        if (originalFilename.contains("..")) {

            log.warn(
                    "Upload rejected: invalid filename '{}'",
                    originalFilename
            );

            throw new InvalidOperationException(
                    "Invalid file name."
            );
        }

        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (extension == null || extension.isBlank()) {

            log.warn(
                    "Upload rejected: filename has no extension ({})",
                    originalFilename
            );

            throw new InvalidOperationException(
                    "Uploaded file must have a valid extension."
            );
        }

        extension = extension.toLowerCase(Locale.ROOT);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {

            log.warn(
                    "Upload rejected: unsupported file extension '{}'",
                    extension
            );

            throw new InvalidOperationException(
                    "Unsupported file extension. Only JPG, JPEG, PNG and WEBP files are allowed."
            );
        }

        log.debug(
                "Validated file extension: {}",
                extension
        );
    }


}