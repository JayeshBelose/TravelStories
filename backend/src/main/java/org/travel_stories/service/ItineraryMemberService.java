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
@Transactional
public class ItineraryMemberService {

    private final ItineraryMemberRepository itineraryMemberRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addMember(UUID itineraryId, UUID userId) {

        if (itineraryMemberRepository.existsByItineraryItineraryIdAndUserUserId(itineraryId, userId)) {
            throw new ResourceAlreadyExistsException(
                    "User is already a member of this itinerary."
            );
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found."));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        ItineraryMember itineraryMember = new ItineraryMember();
        itineraryMember.setItinerary(itinerary);
        itineraryMember.setUser(user);

        itineraryMemberRepository.save(itineraryMember);
    }

    @Transactional
    public void removeMember(UUID itineraryId, UUID userId) {

        if (!itineraryMemberRepository.existsByItineraryItineraryIdAndUserUserId(itineraryId, userId)) {
            throw new ResourceNotFoundException(
                    "Itinerary member not found."
            );
        }

        itineraryMemberRepository.deleteByItineraryItineraryIdAndUserUserId(
                itineraryId,
                userId
        );
    }

}
