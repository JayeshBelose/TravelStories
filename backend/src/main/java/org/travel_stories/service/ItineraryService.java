package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.repository.ItineraryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;

    public ItineraryResponseDto map(Itinerary itinerary){
        ItineraryResponseDto itineraryResponseDto = new ItineraryResponseDto();

        itineraryResponseDto.setPlace(itinerary.getPlace());
        itineraryResponseDto.setTitle(itinerary.getTitle());
        itineraryResponseDto.setThumbnailUrl(itinerary.getThumbnailUrl());
        itineraryResponseDto.setDescription(itinerary.getDescription());
        itineraryResponseDto.setStartDate(itinerary.getStartDate());
        itineraryResponseDto.setEndDate(itinerary.getEndDate());
        itineraryResponseDto.setTotalDays(itinerary.getTotalDays());
        itineraryResponseDto.setIsPublic(itinerary.getIsPublic());
        itineraryResponseDto.setLikeCount(itinerary.getLikeCount());
        itineraryResponseDto.setSaveCount(itinerary.getSaveCount());
        itineraryResponseDto.setCreatedAt(itinerary.getCreatedAt());
        itineraryResponseDto.setLasUpdated(itinerary.getLastUpdated());
        itineraryResponseDto.setCreatedBy(itinerary.getCreatedBy().getUsername());
        itineraryResponseDto.setType(itinerary.getType().getName());

        return itineraryResponseDto;
    }

    public List<ItineraryResponseDto> getAllItineraries(){
        return itineraryRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

}
