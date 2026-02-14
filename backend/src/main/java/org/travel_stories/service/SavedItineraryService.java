package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.SavedItinerary;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.SavedItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SavedItineraryService {

    private final SavedItineraryRepository savedItineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;

    public String saveItinerary(UUID userId, UUID itineraryId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found."));

        if (savedItineraryRepository.existsByUserUserIdAndItineraryItineraryId(userId, itineraryId)){
            savedItineraryRepository.deleteByUserUserIdAndItineraryItineraryId(userId, itineraryId);
            itinerary.setSaveCount(savedItineraryRepository.countByItineraryItineraryId(itineraryId));
            return "Itinerary removed.";
        } else {
            itinerary.setSaveCount(itinerary.getSaveCount()+1);
            SavedItinerary savedItinerary = new SavedItinerary();
            savedItinerary.setUser(user);
            savedItinerary.setItinerary(itinerary);
            savedItineraryRepository.save(savedItinerary);
            itinerary.setSaveCount(savedItineraryRepository.countByItineraryItineraryId(itineraryId));
            return "Itinerary saved.";
        }
    }

    public Boolean checkIfSaved(UUID userId, UUID itineraryId){
        return savedItineraryRepository.existsByUserUserIdAndItineraryItineraryId(userId, itineraryId);
    }

}