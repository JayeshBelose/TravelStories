package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.ItineraryMember;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceAlreadyExistsException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ItineraryMemberRepository;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItineraryMemberService {

    private final ItineraryMemberRepository itineraryMemberRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;


    @Transactional
    public void addMember(UUID itineraryId, UUID userId) {

        if (itineraryMemberRepository.existsByItineraryItineraryIdAndUserUserId(itineraryId, userId)) {
            log.warn(
                    "Failed to add member. User {} is already a member of itinerary {}.",
                    userId,
                    itineraryId
            );

            throw new ResourceAlreadyExistsException(
                    "User is already a member of this itinerary."
            );
        }


        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {
                    log.warn("Failed to add member. Itinerary not found: {}", itineraryId);
                    return new ResourceNotFoundException("Itinerary not found.");
                });


        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Failed to add member. User not found: {}", userId);
                    return new ResourceNotFoundException("User not found.");
                });


        ItineraryMember itineraryMember = new ItineraryMember();

        itineraryMember.setItinerary(itinerary);
        itineraryMember.setUser(user);

        itineraryMemberRepository.save(itineraryMember);


        log.info(
                "Member added: userId={} to itineraryId={}",
                userId,
                itineraryId
        );
    }


    @Transactional
    public void removeMember(UUID itineraryId, UUID userId) {

        if (!itineraryMemberRepository.existsByItineraryItineraryIdAndUserUserId(itineraryId, userId)) {

            log.warn(
                    "Failed to remove member. User {} is not a member of itinerary {}.",
                    userId,
                    itineraryId
            );

            throw new ResourceNotFoundException(
                    "Itinerary member not found."
            );
        }


        itineraryMemberRepository.deleteByItineraryItineraryIdAndUserUserId(
                itineraryId,
                userId
        );


        log.info(
                "Member removed: userId={} from itineraryId={}",
                userId,
                itineraryId
        );
    }

}