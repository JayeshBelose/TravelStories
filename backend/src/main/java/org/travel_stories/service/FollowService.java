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

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public String follow(UUID followerId, UUID followingId) {

        if (followerId.equals(followingId)) {
            throw new InvalidOperationException("User cannot follow themselves.");
        }

        if (followRepository.existsByFollowerUserIdAndFollowingUserId(followerId, followingId)) {
            throw new ResourceAlreadyExistsException("User is already being followed.");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Follower not found."));

        User following = userRepository.findById(followingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Following user not found."));

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);

        followRepository.save(follow);

        return "Followed.";
    }

    @Transactional
    public void unfollow(UUID followerId, UUID followingId) {

        if (!followRepository.existsByFollowerUserIdAndFollowingUserId(followerId, followingId)) {
            throw new ResourceNotFoundException("Follow relationship not found.");
        }

        followRepository.deleteByFollowerUserIdAndFollowingUserId(followerId, followingId);
    }

    public List<FollowResponseDto> getFollowers(UUID userId){
        return followRepository.findFollowers(userId)
                .stream()
                .map(follower -> new FollowResponseDto(
                        follower.getFollower().getUserId(),
                        follower.getFollower().getUsername()
                ))
                .toList();
    }

    public List<FollowResponseDto> getFollowing(UUID userId){
        return followRepository.findFollowing(userId)
                .stream()
                .map(follower -> new FollowResponseDto(
                        follower.getFollowing().getUserId(),
                        follower.getFollowing().getUsername()
                ))
                .toList();
    }

}
