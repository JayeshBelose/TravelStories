package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.FollowResponseDto;
import org.travel_stories.entity.Follow;
import org.travel_stories.entity.User;
import org.travel_stories.repository.FollowRepository;
import org.travel_stories.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public void follow(UUID followerId, UUID followingId){
        if (followerId.equals(followingId)){
            throw new IllegalArgumentException("User cannot follow themself.");
        }

        if (followRepository.existsByFollowerUserIdAndFollowingUserId(followerId, followingId)){
            return;
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found."));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Following user not found."));

        Follow follow = new Follow();

        follow.setFollower(follower);
        follow.setFollowing(following);

        followRepository.save(follow);
    }

    public void unfollow(UUID followerId, UUID followingId){
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
