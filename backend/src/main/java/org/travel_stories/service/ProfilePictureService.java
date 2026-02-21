package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.entity.ProfilePicture;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ProfilePictureRepository;
import org.travel_stories.repository.UserRepository;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfilePictureService {

    private final ProfilePictureRepository profilePictureRepository;
    private final UserRepository userRepository;

    public void uploadOrUpdate(UUID userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        profilePictureRepository.findByUserUserId(userId)
                .ifPresent(pfp -> {
                    try {
                        pfp.setPfpData(file.getBytes());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    pfp.setContentType(file.getContentType());
                });

        if (profilePictureRepository.findByUserUserId(userId).isEmpty()){
            ProfilePicture pfp = new ProfilePicture();
            pfp.setPfpData(file.getBytes());
            pfp.setContentType(file.getContentType());
            pfp.setUser(user);
            profilePictureRepository.save(pfp);
        }
    }

    public ProfilePicture getPfpByUser(UUID userId){
        return profilePictureRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Image not found."));
    }

}