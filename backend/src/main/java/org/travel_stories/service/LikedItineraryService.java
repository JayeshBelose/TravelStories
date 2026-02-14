package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.LikedItinerary;
import org.travel_stories.entity.User;
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

    public String likeItinerary(UUID userId, UUID itineraryId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found."));

        if (likedItineraryRepository.existsByUserUserIdAndItineraryItineraryId(userId, itineraryId)){
            likedItineraryRepository.deleteByUserUserIdAndItineraryItineraryId(userId, itineraryId);
            itinerary.setLikeCount(likedItineraryRepository.countByItineraryItineraryId(itineraryId));
            return "Itinerary disliked.";
        } else {
            LikedItinerary likedItinerary = new LikedItinerary();
            likedItinerary.setUser(user);
            likedItinerary.setItinerary(itinerary);
            likedItineraryRepository.save(likedItinerary);
            itinerary.setLikeCount(likedItineraryRepository.countByItineraryItineraryId(itineraryId));
            return "Itinerary liked.";
        }
    }

    public Boolean checkIfLiked(UUID userId, UUID itineraryId){
        return likedItineraryRepository.existsByUserUserIdAndItineraryItineraryId(userId, itineraryId);
    }

}
