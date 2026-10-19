package org.travel_stories.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.travel_stories.entity.user.Follow;

import java.util.List;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {

    boolean existsByFollowerUserIdAndFollowingUserId(UUID followerId, UUID followingId);

    void deleteByFollowerUserIdAndFollowingUserId(UUID followerId, UUID followingId);

    @Query("SELECT f FROM Follow f WHERE f.following.userId = :userId")
    List<Follow> findFollowers(@Param("userId") UUID userId);

    @Query("SELECT f FROM Follow f WHERE f.follower.userId = :userId")
    List<Follow> findFollowing(@Param("userId") UUID userId);

    void deleteByFollowerUserId(UUID userId);

    void deleteByFollowingUserId(UUID userId);

    @Query("""
        SELECT COUNT(f)
        FROM Follow f
        WHERE f.following.userId = :userId
        """)
    long countFollowers(@Param("userId") UUID userId);

    @Query("""
        SELECT COUNT(f)
        FROM Follow f
        WHERE f.follower.userId = :userId
        """)
    long countFollowing(@Param("userId") UUID userId);

    @Query("""
        SELECT f.following.userId, COUNT(f)
        FROM Follow f
        WHERE f.following.userId IN :userIds
        GROUP BY f.following.userId
        """)
    List<Object[]> countFollowersByUserIds(
            @Param("userIds") List<UUID> userIds
    );

    @Query("""
        SELECT f.follower.userId, COUNT(f)
        FROM Follow f
        WHERE f.follower.userId IN :userIds
        GROUP BY f.follower.userId
        """)
    List<Object[]> countFollowingByUserIds(
            @Param("userIds") List<UUID> userIds
    );

}
