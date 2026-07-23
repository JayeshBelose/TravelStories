package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.FollowResponseDto;
import org.travel_stories.entity.Follow;
import org.travel_stories.entity.User;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceAlreadyExistsException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.UserRepository;
import org.travel_stories.security.AuthorizationService;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;


    @Transactional
    public void follow(
            UUID followerId,
            UUID followingId
    ) {

        authorizationService.verifyOwnership(followerId);

        if (followerId.equals(followingId)) {

            log.warn(
                    "User {} attempted to follow themselves.",
                    followerId
            );

            throw new InvalidOperationException(
                    "User cannot follow themselves."
            );
        }


        if (followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )) {

            log.warn(
                    "User {} attempted to follow user {} who is already being followed.",
                    followerId,
                    followingId
            );

            throw new ResourceAlreadyExistsException(
                    "User is already being followed."
            );
        }


        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> {

                    log.warn(
                            "Follower not found: {}",
                            followerId
                    );

                    return new ResourceNotFoundException(
                            "Follower not found."
                    );
                });


        User following = userRepository.findById(followingId)
                .orElseThrow(() -> {

                    log.warn(
                            "Following user not found: {}",
                            followingId
                    );

                    return new ResourceNotFoundException(
                            "Following user not found."
                    );
                });


        Follow follow = new Follow();

        follow.setFollower(follower);
        follow.setFollowing(following);


        followRepository.save(follow);


        log.info(
                "User {} followed user {}",
                followerId,
                followingId
        );

    }


    @Transactional
    public void unfollow(
            UUID followerId,
            UUID followingId
    ) {

        authorizationService.verifyOwnership(followerId);

        if (!followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )) {

            log.warn(
                    "Failed to unfollow. Follow relationship not found between {} and {}.",
                    followerId,
                    followingId
            );

            throw new ResourceNotFoundException(
                    "Follow relationship not found."
            );
        }


        followRepository.deleteByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        );


        log.info(
                "User {} unfollowed user {}",
                followerId,
                followingId
        );
    }


    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowers(UUID userId) {

        return followRepository.findFollowers(userId)
                .stream()
                .map(follower -> new FollowResponseDto(
                        follower.getFollower().getUserId(),
                        follower.getFollower().getUsername()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowing(UUID userId) {

        return followRepository.findFollowing(userId)
                .stream()
                .map(follower -> new FollowResponseDto(
                        follower.getFollowing().getUserId(),
                        follower.getFollowing().getUsername()
                ))
                .toList();
    }

}