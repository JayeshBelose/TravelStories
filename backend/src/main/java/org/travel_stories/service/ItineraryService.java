package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.DayResponseDto;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.entity.Day;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.ItineraryType;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.ItineraryTypeRepository;
import org.travel_stories.repository.UserRepository;

import java.io.IOException;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryTypeRepository itineraryTypeRepository;

    public ItineraryResponseDto map(Itinerary itinerary){
        ItineraryResponseDto itineraryResponseDto = new ItineraryResponseDto();

        itineraryResponseDto.setItineraryId(itinerary.getItineraryId());
        itineraryResponseDto.setPlace(itinerary.getPlace());
        itineraryResponseDto.setTitle(itinerary.getTitle());

        byte[] image = null;
        if(itinerary.getThumbnail() != null){
            image = itinerary.getThumbnail().getThumbnailData();
        }
        itineraryResponseDto.setThumbnail(image);
        itineraryResponseDto.setDescription(itinerary.getDescription());
        itineraryResponseDto.setStartDate(itinerary.getStartDate());
        itineraryResponseDto.setEndDate(itinerary.getEndDate());
        itineraryResponseDto.setTotalDays(itinerary.getTotalDays());
        itineraryResponseDto.setIsPublic(itinerary.getIsPublic());
        itineraryResponseDto.setLikeCount(itinerary.getLikeCount());
        itineraryResponseDto.setSaveCount(itinerary.getSaveCount());
        itineraryResponseDto.setCreatedAt(itinerary.getCreatedAt());
        itineraryResponseDto.setLastUpdated(itinerary.getLastUpdated());
        itineraryResponseDto.setCreatedBy(itinerary.getCreatedBy().getUserId());
        itineraryResponseDto.setType(itinerary.getType().getName());
        itineraryResponseDto.setMembers(
                itinerary.getMembers().stream()
                        .map(i -> {
                            return i.getUser().getUserId();
                        })
                        .collect(Collectors.toList())
        );

        return itineraryResponseDto;
    }

    public ItineraryResponseDto createItinerary(
            ItineraryRequestDto itineraryRequestDto,
            UUID userId
    ) {
        Itinerary itinerary = new Itinerary();

        itinerary.setPlace(itineraryRequestDto.getPlace());
        itinerary.setTitle(itineraryRequestDto.getTitle());
        itinerary.setDescription(itineraryRequestDto.getDescription());
        itinerary.setStartDate(itineraryRequestDto.getStartDate());
        itinerary.setEndDate(itineraryRequestDto.getEndDate());

        Long totalDays = ChronoUnit.DAYS.between(itineraryRequestDto.getStartDate(), itineraryRequestDto.getEndDate());
        itinerary.setTotalDays(totalDays);
        itinerary.setIsPublic(itineraryRequestDto.getIsPublic());

        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found."));
        itinerary.setCreatedBy(user);

        ItineraryType itineraryType = itineraryTypeRepository.findById(itineraryRequestDto.getType())
                        .orElseThrow(() -> new RuntimeException("Type not found."));
        itinerary.setType(itineraryType);

        Itinerary newItinerary = itineraryRepository.save(itinerary);

        return map(newItinerary);
    }

    public void deleteItineraryById(UUID itineraryId){
        itineraryRepository.deleteById(itineraryId);
    }

    public ItineraryResponseDto updateItinerary(
            ItineraryRequestDto itineraryRequestDto,
            UUID itineraryId
    ){
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found."));

        itinerary.setPlace(itineraryRequestDto.getPlace());
        itinerary.setTitle(itineraryRequestDto.getTitle());
        itinerary.setDescription(itineraryRequestDto.getDescription());
        itinerary.setStartDate(itineraryRequestDto.getStartDate());
        itinerary.setEndDate(itineraryRequestDto.getEndDate());

        Long totalDays = ChronoUnit.DAYS.between(itineraryRequestDto.getStartDate(), itineraryRequestDto.getEndDate());
        itinerary.setTotalDays(totalDays);
        itinerary.setIsPublic(itineraryRequestDto.getIsPublic());

        ItineraryType itineraryType = itineraryTypeRepository.findById(itineraryRequestDto.getType())
                .orElseThrow(() -> new RuntimeException("Type not found."));
        itinerary.setType(itineraryType);

        Itinerary updatedItinerary = itineraryRepository.save(itinerary);
        return map(updatedItinerary);
    }

    public List<ItineraryResponseDto> getAllItineraries(){
        return itineraryRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public ItineraryResponseDto getItineraryById(UUID itineraryId){
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found."));
        return map(itinerary);
    }

    public List<ItineraryResponseDto> getAllItinerariesByType(Long typeId){
        return itineraryRepository.findAllByTypeTypeId(typeId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ItineraryResponseDto> getAllItinerariesByUserId(UUID userId){
        return itineraryRepository.findAllByCreatedByUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ItineraryResponseDto> getAllItinerariesByUserMembership(UUID userId){
        return itineraryRepository.findAllByMembersUserUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ItineraryResponseDto> getAllSavedItinerariesByUserId(UUID userId){
        return itineraryRepository.findAllBySavedByUserUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ItineraryResponseDto> getMostSavedItineraries(){
        return itineraryRepository.findMostSavedItineraries()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ItineraryResponseDto> getMostLikedItineraries(){
        return itineraryRepository.findMostLikedItineraries()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

}
