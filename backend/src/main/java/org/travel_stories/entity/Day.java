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
        name = "day",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"itinerary_id", "day_number"}
        )
)
public class Day {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "day_id",
            nullable = false
    )
    private UUID dayId;

    @Column(
            name = "day_number",
             updatable = false
    )
    private Integer dayNumber;

    @Column(
            name = "description"
    )
    private String description;

    @ManyToOne
    @JoinColumn(
            name = "itinerary_id",
            nullable = false
    )
    private Itinerary itinerary;

}
