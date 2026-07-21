package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ProfilePictureRepository;
import org.travel_stories.repository.UserRepository;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProfilePictureService {

    private final ProfilePictureRepository profilePictureRepository;
    private final UserRepository userRepository;

    @Transactional
    public void uploadOrUpdate(
            UUID userId,
            MultipartFile file
    ) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        ));

        Optional<ProfilePicture> existingPfp =
                profilePictureRepository.findByUserUserId(userId);

        if (existingPfp.isPresent()) {

            ProfilePicture pfp = existingPfp.get();

            pfp.setPfpData(file.getBytes());
            pfp.setContentType(file.getContentType());

            log.info("Profile picture updated for user {}", userId);

        } else {

            ProfilePicture pfp = new ProfilePicture();

            pfp.setPfpData(file.getBytes());
            pfp.setContentType(file.getContentType());
            pfp.setUser(user);

            profilePictureRepository.save(pfp);

            log.info("Profile picture uploaded for user {}", userId);
        }
    }

    public ProfilePicture getPfpByUser(UUID userId) {

        return profilePictureRepository.findByUserUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Profile picture not found."
                        ));
    }

}