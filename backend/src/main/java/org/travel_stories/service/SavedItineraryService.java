package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.SavedItinerary;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.SavedItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedItineraryService {

    private final SavedItineraryRepository savedItineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;


    @Transactional
    public String saveItinerary(
            UUID userId,
            UUID itineraryId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to save itinerary: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });


        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to save itinerary: itinerary not found, itineraryId={}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Itinerary not found."
                    );
                });


        boolean alreadySaved =
                savedItineraryRepository
                        .existsByUserUserIdAndItineraryItineraryId(
                                userId,
                                itineraryId
                        );


        if (alreadySaved) {

            savedItineraryRepository
                    .deleteByUserUserIdAndItineraryItineraryId(
                            userId,
                            itineraryId
                    );


            itinerary.setSaveCount(
                    savedItineraryRepository
                            .countByItineraryItineraryId(itineraryId)
            );


            log.info(
                    "User {} removed itinerary {} from saved itineraries",
                    userId,
                    itineraryId
            );


            return "Itinerary removed.";

        } else {

            SavedItinerary savedItinerary =
                    new SavedItinerary();

            savedItinerary.setUser(user);
            savedItinerary.setItinerary(itinerary);


            savedItineraryRepository.save(savedItinerary);


            itinerary.setSaveCount(
                    savedItineraryRepository
                            .countByItineraryItineraryId(itineraryId)
            );


            log.info(
                    "User {} saved itinerary {}",
                    userId,
                    itineraryId
            );


            return "Itinerary saved.";
        }
    }


    public Boolean checkIfSaved(
            UUID userId,
            UUID itineraryId
    ) {

        userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to check saved itinerary: user not found, userId={}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found."
                    );
                });


        itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {
                    log.warn(
                            "Failed to check saved itinerary: itinerary not found, itineraryId={}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Itinerary not found."
                    );
                });


        return savedItineraryRepository
                .existsByUserUserIdAndItineraryItineraryId(
                        userId,
                        itineraryId
                );
    }

}