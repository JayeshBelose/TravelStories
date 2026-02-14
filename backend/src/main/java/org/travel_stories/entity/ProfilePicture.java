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
@Table(name = "profile_picture")
public class ProfilePicture {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "pfp_id",
            nullable = false,
            updatable = false
    )
    private UUID pfpId;

    @Column(
            name = "pfp_data",
            nullable = true
    )
    private byte[] pfpData;

    @Column(
            name = "content_type",
            nullable = true
    )
    private String contentType;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "userId",
            nullable = false,
            unique = true
    )
    private User user;

}
