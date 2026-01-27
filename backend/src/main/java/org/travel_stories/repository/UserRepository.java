package org.travel_stories.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.travel_stories.entity.User;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
}
