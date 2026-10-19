package org.travel_stories.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.user.ProfilePicture;

import java.util.Optional;
import java.util.UUID;

public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, UUID> {

    Optional<ProfilePicture> findByUserUserId(UUID userId);

}