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
@Table(
        name = "follow",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"follower_id", "following_id"}
        )
)
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "follow_id",
            nullable = false
    )
    private UUID followId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "follower_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User follower;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "following_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User following;

}
