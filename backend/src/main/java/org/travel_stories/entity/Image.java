package org.travel_stories.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "image")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "image_id",
            nullable = false,
            updatable = false
    )
    private UUID imageId;

    @Column(
            name = "order_number",
            nullable = false
    )
    private Integer orderNumber;

    @Column(
            name = "file_path",
            nullable = false
    )
    private String filePath;

    @Column(
            name = "content_type",
            nullable = false
    )
    private String contentType;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "location_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Location location;

}