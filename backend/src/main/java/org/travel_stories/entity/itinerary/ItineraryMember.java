package org.travel_stories.entity.itinerary;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.travel_stories.entity.user.User;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "itinerary_member",
        uniqueConstraints = @UniqueConstraint(columnNames = {"itinerary_id", "user_id"}),
        indexes = {
                @Index(
                        name = "idx_itinerary_member_user",
                        columnList = "user_id"
                )
        }
)
public class ItineraryMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(
            name = "member_id",
            nullable = false
    )
    private Long memberId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "itinerary_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Itinerary itinerary;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

}
