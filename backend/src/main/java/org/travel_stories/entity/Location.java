package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "location",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"day_id", "location_number"}
        )
)
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "location_id",
            nullable = false,
            updatable = false
    )
    private UUID locationId;

    @Column(
            name = "location_number",
            updatable = false
    )
    private Integer locationNumber;

    @Column(
            name = "location_name",
            nullable = false
    )
    private String locationName;

    @Column(
            name = "location_address",
            nullable = true,
            length = 500
    )
    private String locationAddress;

    @ManyToOne
    @JoinColumn(
            name = "day_id",
            nullable = false
    )
    private Day day;

    @OneToMany(
            mappedBy = "location",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("orderNumber ASC")
    private List<Image> images = new ArrayList<>();

}
