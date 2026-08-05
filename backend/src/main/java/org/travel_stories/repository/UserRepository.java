package org.travel_stories.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.travel_stories.entity.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    User findByUsername(String username);

    @Query("""
                SELECT u FROM User u
                WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<User> searchUsers(String query);

    @Query("""
                SELECT u FROM User u
                WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<User> searchUsersForAdmin(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.createdAt) = :date")
    long countByCreatedAt(@Param("date") LocalDate date);

}
