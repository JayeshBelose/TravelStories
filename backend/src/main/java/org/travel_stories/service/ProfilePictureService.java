package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.entity.User;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ProfilePictureRepository;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.AuthorizationService;

import java.io.IOException;
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


        if (existingPfp.isPresent()) {

            ProfilePicture pfp = existingPfp.get();

            try {

                pfp.setPfpData(file.getBytes());

            } catch (IOException exception) {

                log.error(
                        "Failed to read profile picture file for user {}",
                        userId,
                        exception
                );

                throw new InvalidOperationException(
                        "Unable to process thumbnail file."
                );
            }

            pfp.setContentType(detectedMimeType);

            log.info(
                    "Profile picture updated for user {}",
                    userId
            );

        } else {

            ProfilePicture pfp = new ProfilePicture();

            try {

                pfp.setPfpData(file.getBytes());

            } catch (IOException exception) {

                log.error(
                        "Failed to read profile picture file for user {}",
                        userId,
                        exception
                );

                throw new InvalidOperationException(
                        "Unable to process thumbnail file."
                );
            }

            pfp.setContentType(detectedMimeType);
            pfp.setUser(user);

            profilePictureRepository.save(pfp);

            log.info(
                    "Profile picture uploaded for user {}",
                    userId
            );
        }
    }


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

}