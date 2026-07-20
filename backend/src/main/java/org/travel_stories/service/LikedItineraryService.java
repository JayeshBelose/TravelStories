package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.LikedItinerary;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.LikedItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LikedItineraryService {

    private final LikedItineraryRepository likedItineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;

    @Transactional
    public String likeItinerary(UUID userId, UUID itineraryId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found."));

        boolean alreadyLiked =
                likedItineraryRepository
                        .existsByUserUserIdAndItineraryItineraryId(
                                userId,
                                itineraryId
                        );

        if (alreadyLiked) {

            likedItineraryRepository
                    .deleteByUserUserIdAndItineraryItineraryId(
                            userId,
                            itineraryId
                    );

            itinerary.setLikeCount(
                    likedItineraryRepository
                            .countByItineraryItineraryId(itineraryId)
            );

            return "Itinerary disliked.";

        } else {

            LikedItinerary likedItinerary = new LikedItinerary();

            likedItinerary.setUser(user);
            likedItinerary.setItinerary(itinerary);

            likedItineraryRepository.save(likedItinerary);

            itinerary.setLikeCount(
                    likedItineraryRepository
                            .countByItineraryItineraryId(itineraryId)
            );

            return "Itinerary liked.";
        }
    }

    public Boolean checkIfLiked(UUID userId, UUID itineraryId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found."));

        return likedItineraryRepository
                .existsByUserUserIdAndItineraryItineraryId(
                        userId,
                        itineraryId
                );
    }

}
