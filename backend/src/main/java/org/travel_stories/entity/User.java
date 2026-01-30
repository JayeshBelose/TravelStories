package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "user_id",
            nullable = false,
            updatable = false
    )
    private UUID userId;

    @Column(
            name = "username",
            length = 20,
            unique = true,
            nullable = false
    )
    private String username;

    @Column(
            name = "email",
            nullable = false,
            unique = true
    )
    private String email;

    @Column(
            name = "password",
            nullable = false
    )
    private String password;

    @Column(
            name = "profile_pic_url",
            nullable = true,
            length = 500
    )
    private String profilePicUrl;

    @Column(
            name = "bio",
            nullable = true,
            length = 255
    )
    private String bio;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @OneToMany(
            mappedBy = "follower",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<Follow> following = new HashSet<>();//Users this user following

    @OneToMany(
            mappedBy = "following",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<Follow> followers = new HashSet<>();//Users following this user

    @OneToMany(
            mappedBy = "createdBy",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Itinerary> itineraries = new ArrayList<>();

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ItineraryMember> membership = new ArrayList<>();

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SavedItinerary> savedItineraries = new ArrayList<>();

}
