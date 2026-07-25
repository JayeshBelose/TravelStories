package org.travel_stories.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.exception.InvalidOperationException;

import java.io.IOException;
import java.util.Set;

@Service
@Slf4j
public class FileValidationService {

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
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

        try {

            String detectedType =
                    tika.detect(file.getInputStream());

            if (!ALLOWED_IMAGE_MIME_TYPES.contains(detectedType)) {

                log.warn("Upload rejected. Unsupported MIME type: {}", detectedType);

                throw new InvalidOperationException(
                        "Unsupported file type. Only JPEG, PNG and WebP images are allowed."
                );
            }

            log.debug("Upload MIME validated successfully: {}", detectedType);
            return detectedType;

        } catch (IOException ex) {

            log.error("Unable to inspect uploaded file.", ex);

            throw new InvalidOperationException(
                    "Unable to validate uploaded file."
            );
        }

    }


}