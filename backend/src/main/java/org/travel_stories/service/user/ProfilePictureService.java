package org.travel_stories.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.user.ProfilePicture;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.user.ProfilePictureRepository;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.security.auth.AuthorizationService;
import org.travel_stories.service.storage.FileValidationService;
import org.travel_stories.service.storage.FileStorageCategory;
import org.travel_stories.service.storage.StorageService;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfilePictureService {

    private final ProfilePictureRepository profilePictureRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final FileValidationService fileValidationService;
    private final StorageService storageService;


    @Transactional
    public void uploadOrUpdate(
            UUID userId,
            MultipartFile file
    ) {

        String detectedMimeType =
                fileValidationService.validateMimeType(file);

        authorizationService.verifyOwnership(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to upload/update profile picture: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });

        Optional<ProfilePicture> existingPfp =
                profilePictureRepository.findByUserUserId(userId);

        String newFilePath = null;

        try {

            newFilePath =
                    storageService.store(
                            file,
                            FileStorageCategory.PROFILE_PICTURE
                    );

            if (existingPfp.isPresent()) {

                ProfilePicture pfp = existingPfp.get();

                String oldFilePath = pfp.getFilePath();

                pfp.setFilePath(newFilePath);
                pfp.setContentType(detectedMimeType);

                profilePictureRepository.save(pfp);

                if (oldFilePath != null
                        && !oldFilePath.equals(newFilePath)) {

                    storageService.delete(oldFilePath);
                }

                log.info(
                        "Profile picture updated for user {}, filePath={}",
                        userId,
                        newFilePath
                );

            } else {

                ProfilePicture pfp = new ProfilePicture();

                pfp.setFilePath(newFilePath);
                pfp.setContentType(detectedMimeType);
                pfp.setUser(user);

                profilePictureRepository.save(pfp);

                log.info(
                        "Profile picture uploaded for user {}, filePath={}",
                        userId,
                        newFilePath
                );
            }

        } catch (RuntimeException exception) {

            /*
             * If database persistence fails after the physical
             * file has been created, clean up the newly stored file.
             */
            if (newFilePath != null) {

                try {

                    storageService.delete(
                            newFilePath
                    );

                } catch (RuntimeException cleanupException) {

                    log.error(
                            "Failed to clean up profile picture after upload failure: {}",
                            newFilePath,
                            cleanupException
                    );
                }
            }

            throw exception;
        }
    }


    @Transactional(readOnly = true)
    public ProfilePicture getPfpByUser(UUID userId) {

        return profilePictureRepository.findByUserUserId(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to fetch profile picture: profile picture not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "Profile picture not found."
                    );
                });
    }

    @Transactional(readOnly = true)
    public Resource getProfilePictureResource(ProfilePicture pfp) {

        return storageService.load(
                pfp.getFilePath()
        );
    }

    public long getProfilePictureLastModified(ProfilePicture profilePicture) {
        return storageService.getLastModified(profilePicture.getFilePath());
    }

}