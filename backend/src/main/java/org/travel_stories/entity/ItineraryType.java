package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "itinerary_type")
public class ItineraryType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(
            name = "type_id",
            nullable = false,
            updatable = false
    )
    private Long typeId;

    @Column(
            name = "name",
            length = 50,
            nullable = false
    )
    private String name;

    @OneToMany(mappedBy = "type")
    private List<Itinerary> itineraries = new ArrayList<>();

}
