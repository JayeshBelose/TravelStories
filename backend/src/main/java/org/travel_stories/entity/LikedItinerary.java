package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "liked_itinerary",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "itinerary_id"})
)
public class LikedItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "like_id",
            nullable = false
    )
    private UUID likeId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "itinerary_id",
            nullable = false
    )
    private Itinerary itinerary;

}
