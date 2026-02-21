package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.List;
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
            nullable = false
    )
    private Integer dayNumber;

    @Column(
            name = "description",
            length = 500
    )
    private String description;

    @ManyToOne
    @JoinColumn(
            name = "itinerary_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Itinerary itinerary;

    @OneToMany(
            mappedBy = "day",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("locationNumber ASC")
    private List<Location> locations;

}
