package org.travel_stories.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.exception.operation.InvalidOperationException;

import java.net.MalformedURLException;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(
        name = "app.storage.provider",
        havingValue = "cloudinary"
)
public class CloudinaryStorageService
        implements StorageService {

    private static final String STORAGE_PREFIX =
            "cloudinary:";

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name}")
            String cloudName,

            @Value("${cloudinary.api-key}")
            String apiKey,

            @Value("${cloudinary.api-secret}")
            String apiSecret
    ) {

        log.info(
                "Cloudinary configuration loaded: cloudName={}, apiKeyPresent={}, apiSecretPresent={}, apiKeyLength={}, apiSecretLength={}",
                cloudName,
                apiKey != null && !apiKey.isBlank(),
                apiSecret != null && !apiSecret.isBlank(),
                apiKey != null ? apiKey.length() : 0,
                apiSecret != null ? apiSecret.length() : 0
        );

        this.cloudinary =
                new Cloudinary(
                        ObjectUtils.asMap(
                                "cloud_name",
                                cloudName,
                                "api_key",
                                apiKey,
                                "api_secret",
                                apiSecret,
                                "secure",
                                true
                        )
                );
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

        String publicId =
                buildPublicId(category);

        try {

            Map<?, ?> result =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "public_id",
                                    publicId,
                                    "resource_type",
                                    "image",
                                    "overwrite",
                                    false
                            )
                    );

            String uploadedPublicId =
                    (String) result.get("public_id");

            if (uploadedPublicId == null
                    || uploadedPublicId.isBlank()) {

                throw new InvalidOperationException(
                        "Cloudinary did not return a valid asset identifier."
                );
            }

            String storageKey =
                    STORAGE_PREFIX + uploadedPublicId;

            log.info(
                    "Cloudinary asset uploaded. category={}, storageKey={}",
                    category,
                    storageKey
            );

            return storageKey;

        } catch (Exception exception) {

            log.error(
                    "Failed to upload asset to Cloudinary. category={}",
                    category,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to store uploaded file."
            );
        }
    }

    @Override
    public Resource load(String storageKey) {

        String publicId =
                extractPublicId(storageKey);

        String secureUrl =
                cloudinary
                        .url()
                        .secure(true)
                        .resourceType("image")
                        .generate(publicId);

        try {

            Resource resource =
                    new UrlResource(secureUrl);

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new InvalidOperationException(
                        "Stored file could not be read."
                );
            }

            return resource;

        } catch (MalformedURLException exception) {

            log.error(
                    "Failed to create Cloudinary resource: {}",
                    storageKey,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to load stored file."
            );
        }
    }

    @Override
    public void delete(String storageKey) {

        if (storageKey == null
                || storageKey.isBlank()) {

            return;
        }

        String publicId =
                extractPublicId(storageKey);

        try {

            Map<?, ?> result =
                    cloudinary.uploader().destroy(
                            publicId,
                            ObjectUtils.asMap(
                                    "resource_type",
                                    "image",
                                    "invalidate",
                                    true
                            )
                    );

            String deletionResult =
                    String.valueOf(
                            result.get("result")
                    );

            if (!"ok".equals(deletionResult)
                    && !"not found".equals(deletionResult)) {

                throw new InvalidOperationException(
                        "Unable to delete stored file."
                );
            }

            log.info(
                    "Cloudinary asset deleted. storageKey={}, result={}",
                    storageKey,
                    deletionResult
            );

        } catch (InvalidOperationException exception) {

            throw exception;

        } catch (Exception exception) {

            log.error(
                    "Failed to delete Cloudinary asset: {}",
                    storageKey,
                    exception
            );

            throw new InvalidOperationException(
                    "Unable to delete stored file."
            );
        }
    }

    @Override
    public boolean exists(String storageKey) {

        if (storageKey == null
                || storageKey.isBlank()) {

            return false;
        }

        String publicId =
                extractPublicId(storageKey);

        try {

            cloudinary.api().resource(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            "image"
                    )
            );

            return true;

        } catch (Exception exception) {

            return false;
        }
    }

    @Override
    public long getLastModified(String storageKey) {

        /*
         * Cloudinary assets are remotely hosted.
         * We intentionally avoid making an additional
         * Admin API request for every image GET request
         * just to determine modification time.
         *
         * The controller already uses no-cache behavior.
         */
        return 0L;
    }

    private String buildPublicId(
            FileStorageCategory category
    ) {

        return "travel-stories/"
                + category.getDirectoryName()
                + "/"
                + UUID.randomUUID();
    }

    private String extractPublicId(
            String storageKey
    ) {

        if (storageKey == null
                || !storageKey.startsWith(
                STORAGE_PREFIX
        )) {

            throw new InvalidOperationException(
                    "Invalid Cloudinary storage key."
            );
        }

        String publicId =
                storageKey.substring(
                        STORAGE_PREFIX.length()
                );

        if (publicId.isBlank()) {

            throw new InvalidOperationException(
                    "Invalid Cloudinary storage key."
            );
        }

        return publicId;
    }
}