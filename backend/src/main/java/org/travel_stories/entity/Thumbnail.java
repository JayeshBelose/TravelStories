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
@Table(name = "thumbnail")
public class Thumbnail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "thumbnail_id",
            nullable = false,
            updatable = false
    )
    private UUID thumbnailId;

    @Column(
            name = "thumbnail_data",
            nullable = true
    )
    private byte[] thumbnailData;

    @Column(
            name = "content_type",
            nullable = true
    )
    private String contentType;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "itinerary_id",
            nullable = false,
            unique = true
    )
    private Itinerary itinerary;

}
