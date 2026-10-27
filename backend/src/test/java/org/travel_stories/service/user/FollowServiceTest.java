package org.travel_stories.service.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.travel_stories.dto.user.social.response.FollowResponseDto;
import org.travel_stories.entity.user.Follow;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.resource.ResourceAlreadyExistsException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.user.FollowRepository;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.security.auth.AuthorizationService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthorizationService authorizationService;

    @InjectMocks
    private FollowService followService;

    private UUID followerId;
    private UUID followingId;

    private User follower;
    private User following;

    @BeforeEach
    void setUp() {
        followerId = UUID.randomUUID();
        followingId = UUID.randomUUID();

        follower = mock(User.class);
        following = mock(User.class);
    }

    // ---------------------------------------------------------
    // follow()
    // ---------------------------------------------------------

    @Test
    void shouldFollowUserSuccessfully() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(false);

        when(userRepository.findById(followerId))
                .thenReturn(Optional.of(follower));

        when(userRepository.findById(followingId))
                .thenReturn(Optional.of(following));

        followService.follow(followerId, followingId);

        ArgumentCaptor<Follow> followCaptor =
                ArgumentCaptor.forClass(Follow.class);

        verify(followRepository).save(followCaptor.capture());

        Follow savedFollow = followCaptor.getValue();

        assertThat(savedFollow.getFollower()).isSameAs(follower);
        assertThat(savedFollow.getFollowing()).isSameAs(following);

        verify(authorizationService).verifyOwnership(followerId);
        verify(followRepository)
                .existsByFollowerUserIdAndFollowingUserId(
                        followerId,
                        followingId
                );
        verify(userRepository).findById(followerId);
        verify(userRepository).findById(followingId);
    }

    @Test
    void shouldRejectSelfFollow() {

        assertThatThrownBy(() ->
                followService.follow(followerId, followerId)
        )
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("User cannot follow themselves.");

        verify(authorizationService).verifyOwnership(followerId);

        verifyNoInteractions(followRepository);
        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldRejectDuplicateFollow() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(true);

        assertThatThrownBy(() ->
                followService.follow(followerId, followingId)
        )
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage("User is already being followed.");

        verify(authorizationService).verifyOwnership(followerId);

        verify(followRepository)
                .existsByFollowerUserIdAndFollowingUserId(
                        followerId,
                        followingId
                );

        verify(userRepository, never()).findById(any());
        verify(followRepository, never()).save(any());
    }

    @Test
    void shouldRejectFollowWhenFollowerDoesNotExist() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(false);

        when(userRepository.findById(followerId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                followService.follow(followerId, followingId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Follower not found.");

        verify(authorizationService).verifyOwnership(followerId);

        verify(userRepository).findById(followerId);
        verify(userRepository, never()).findById(followingId);
        verify(followRepository, never()).save(any());
    }

    @Test
    void shouldRejectFollowWhenFollowingUserDoesNotExist() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(false);

        when(userRepository.findById(followerId))
                .thenReturn(Optional.of(follower));

        when(userRepository.findById(followingId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                followService.follow(followerId, followingId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Following user not found.");

        verify(authorizationService).verifyOwnership(followerId);

        verify(userRepository).findById(followerId);
        verify(userRepository).findById(followingId);
        verify(followRepository, never()).save(any());
    }

    // ---------------------------------------------------------
    // unfollow()
    // ---------------------------------------------------------

    @Test
    void shouldUnfollowUserSuccessfully() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(true);

        followService.unfollow(followerId, followingId);

        verify(authorizationService).verifyOwnership(followerId);

        verify(followRepository)
                .existsByFollowerUserIdAndFollowingUserId(
                        followerId,
                        followingId
                );

        verify(followRepository)
                .deleteByFollowerUserIdAndFollowingUserId(
                        followerId,
                        followingId
                );
    }

    @Test
    void shouldRejectUnfollowWhenRelationshipDoesNotExist() {

        when(followRepository.existsByFollowerUserIdAndFollowingUserId(
                followerId,
                followingId
        )).thenReturn(false);

        assertThatThrownBy(() ->
                followService.unfollow(followerId, followingId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Follow relationship not found.");

        verify(authorizationService).verifyOwnership(followerId);

        verify(followRepository)
                .existsByFollowerUserIdAndFollowingUserId(
                        followerId,
                        followingId
                );

        verify(followRepository, never())
                .deleteByFollowerUserIdAndFollowingUserId(
                        any(),
                        any()
                );
    }

    // ---------------------------------------------------------
    // getFollowers()
    // ---------------------------------------------------------

    @Test
    void shouldGetFollowersSuccessfully() {

        UUID firstFollowerId = UUID.randomUUID();
        UUID secondFollowerId = UUID.randomUUID();

        User firstFollower = mock(User.class);
        User secondFollower = mock(User.class);

        when(firstFollower.getUserId()).thenReturn(firstFollowerId);
        when(firstFollower.getUsername()).thenReturn("alice");

        when(secondFollower.getUserId()).thenReturn(secondFollowerId);
        when(secondFollower.getUsername()).thenReturn("bob");

        Follow firstFollow = mock(Follow.class);
        Follow secondFollow = mock(Follow.class);

        when(firstFollow.getFollower()).thenReturn(firstFollower);
        when(secondFollow.getFollower()).thenReturn(secondFollower);

        when(followRepository.findFollowers(followingId))
                .thenReturn(List.of(firstFollow, secondFollow));

        List<FollowResponseDto> result =
                followService.getFollowers(followingId);

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getUserId())
                .isEqualTo(firstFollowerId);
        assertThat(result.get(0).getUsername())
                .isEqualTo("alice");

        assertThat(result.get(1).getUserId())
                .isEqualTo(secondFollowerId);
        assertThat(result.get(1).getUsername())
                .isEqualTo("bob");

        verify(followRepository).findFollowers(followingId);
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoFollowers() {

        when(followRepository.findFollowers(followingId))
                .thenReturn(List.of());

        List<FollowResponseDto> result =
                followService.getFollowers(followingId);

        assertThat(result).isEmpty();

        verify(followRepository).findFollowers(followingId);
    }

    // ---------------------------------------------------------
    // getFollowing()
    // ---------------------------------------------------------

    @Test
    void shouldGetFollowingSuccessfully() {

        UUID firstFollowingId = UUID.randomUUID();
        UUID secondFollowingId = UUID.randomUUID();

        User firstFollowing = mock(User.class);
        User secondFollowing = mock(User.class);

        when(firstFollowing.getUserId()).thenReturn(firstFollowingId);
        when(firstFollowing.getUsername()).thenReturn("charlie");

        when(secondFollowing.getUserId()).thenReturn(secondFollowingId);
        when(secondFollowing.getUsername()).thenReturn("david");

        Follow firstFollow = mock(Follow.class);
        Follow secondFollow = mock(Follow.class);

        when(firstFollow.getFollowing()).thenReturn(firstFollowing);
        when(secondFollow.getFollowing()).thenReturn(secondFollowing);

        when(followRepository.findFollowing(followerId))
                .thenReturn(List.of(firstFollow, secondFollow));

        List<FollowResponseDto> result =
                followService.getFollowing(followerId);

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getUserId())
                .isEqualTo(firstFollowingId);
        assertThat(result.get(0).getUsername())
                .isEqualTo("charlie");

        assertThat(result.get(1).getUserId())
                .isEqualTo(secondFollowingId);
        assertThat(result.get(1).getUsername())
                .isEqualTo("david");

        verify(followRepository).findFollowing(followerId);
    }

    @Test
    void shouldReturnEmptyListWhenUserFollowsNobody() {

        when(followRepository.findFollowing(followerId))
                .thenReturn(List.of());

        List<FollowResponseDto> result =
                followService.getFollowing(followerId);

        assertThat(result).isEmpty();

        verify(followRepository).findFollowing(followerId);
    }
}