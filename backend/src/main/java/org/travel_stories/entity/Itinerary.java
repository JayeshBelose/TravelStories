package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "itinerary")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "itinerary_id",
            nullable = false,
            updatable = false
    )
    private UUID itineraryId;

    @Column(
            name = "place",
            length = 50,
            nullable = false
    )
    private String place;

    @Column(
            name = "title",
            length = 50,
            nullable = false
    )
    private String title;

    @Column(
            name = "thumbnail_url",
            length = 500,
            nullable = false
    )
    private String thumbnailUrl;

    @Column(
            name = "description"
    )
    private String description;

    @Column(
            name = "start_date",
            nullable = false
    )
    private LocalDate startDate;

    @Column(
            name = "end_date",
            nullable = false
    )
    private LocalDate endDate;

    @Column(
            name = "total_days",
            nullable = false
    )
    private Long totalDays;

    @Column(
            name = "is_public",
            nullable = false
    )
    private Boolean isPublic = true;

    @Column(
            name = "like_count"
    )
    private Integer likeCount = 0;

    @Column(
            name = "save_count"
    )
    private Integer saveCount = 0;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @UpdateTimestamp
    @Column(
            name = "last_updated",
            nullable = false,
            updatable = false
    )
    private Instant lastUpdated;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User createdBy;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "type_id",
            nullable = false
    )
    private ItineraryType type;

    @OneToMany(
            mappedBy = "itinerary",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("dayNumber ASC")
    private List<Day> days;

    @OneToMany(
            mappedBy = "itinerary",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ItineraryMember> members = new ArrayList<>();

}