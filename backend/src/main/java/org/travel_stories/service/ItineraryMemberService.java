package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.ItineraryMember;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ItineraryMemberRepository;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ItineraryMemberService {

    private final ItineraryMemberRepository itineraryMemberRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    public void addMember(UUID itineraryId, UUID userId){
        if (itineraryMemberRepository.existsByItineraryItineraryIdAndUserUserId(itineraryId, userId))
            return;

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        ItineraryMember itineraryMember = new ItineraryMember();
        itineraryMember.setItinerary(itinerary);
        itineraryMember.setUser(user);

        itineraryMemberRepository.save(itineraryMember);
    }

    public void removeMember(UUID itineraryId, UUID userId){
        itineraryMemberRepository.deleteByItineraryItineraryIdAndUserUserId(itineraryId, userId);
    }

}
