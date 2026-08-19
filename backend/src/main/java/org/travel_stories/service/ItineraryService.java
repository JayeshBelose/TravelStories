package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.ItineraryRequestDto;
import org.travel_stories.dto.ItineraryResponseDto;
import org.travel_stories.dto.MemberResponseDto;
import org.travel_stories.entity.*;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.*;
import org.travel_stories.security.AuthorizationService;
import org.travel_stories.service.storage.FileStorageService;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryTypeRepository itineraryTypeRepository;
    private final LikedItineraryRepository likedItineraryRepository;
    private final SavedItineraryRepository savedItineraryRepository;
    private final AuthorizationService authorizationService;
    private final ThumbnailRepository thumbnailRepository;
    private final ImageRepository imageRepository;
    private final FileStorageService fileStorageService;


    public ItineraryResponseDto map(Itinerary itinerary) {

        ItineraryResponseDto itineraryResponseDto = new ItineraryResponseDto();

        itineraryResponseDto.setItineraryId(itinerary.getItineraryId());
        itineraryResponseDto.setPlace(itinerary.getPlace());
        itineraryResponseDto.setTitle(itinerary.getTitle());
        itineraryResponseDto.setDescription(itinerary.getDescription());
        itineraryResponseDto.setStartDate(itinerary.getStartDate());
        itineraryResponseDto.setEndDate(itinerary.getEndDate());
        itineraryResponseDto.setTotalDays(itinerary.getTotalDays());
        itineraryResponseDto.setPublic(itinerary.isPublic());
        itineraryResponseDto.setLikeCount(itinerary.getLikeCount());
        itineraryResponseDto.setSaveCount(itinerary.getSaveCount());
        itineraryResponseDto.setCreatedAt(itinerary.getCreatedAt());
        itineraryResponseDto.setLastUpdated(itinerary.getLastUpdated());
        itineraryResponseDto.setCreatedBy(itinerary.getCreatedBy().getUsername());
        itineraryResponseDto.setType(itinerary.getType().getName());

        itineraryResponseDto.setMembers(
                itinerary.getMembers().stream()
                        .map(m -> {
                            MemberResponseDto dto = new MemberResponseDto();
                            dto.setUsername(m.getUser().getUsername());
                            dto.setUserId(m.getUser().getUserId());
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return itineraryResponseDto;
    }


    @Transactional
    public ItineraryResponseDto createItinerary(
            ItineraryRequestDto itineraryRequestDto,
            UUID userId
    ) {

        if (itineraryRequestDto.getEndDate()
                .isBefore(itineraryRequestDto.getStartDate())) {

            throw new InvalidOperationException(
                    "End date cannot be before start date."
            );
        }

        authorizationService.verifyOwnership(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found.")
                );

        ItineraryType itineraryType =
                itineraryTypeRepository.findByName(itineraryRequestDto.getType());

        if (itineraryType == null) {
            throw new ResourceNotFoundException(
                    "Itinerary type not found."
            );
        }

        Itinerary itinerary = new Itinerary();

        itinerary.setPlace(itineraryRequestDto.getPlace());
        itinerary.setTitle(itineraryRequestDto.getTitle());
        itinerary.setDescription(itineraryRequestDto.getDescription());
        itinerary.setStartDate(itineraryRequestDto.getStartDate());
        itinerary.setEndDate(itineraryRequestDto.getEndDate());

        itinerary.setTotalDays(
                ChronoUnit.DAYS.between(
                        itineraryRequestDto.getStartDate(),
                        itineraryRequestDto.getEndDate()
                ) + 1
        );

        itinerary.setPublic(itineraryRequestDto.isPublic());
        itinerary.setCreatedBy(user);
        itinerary.setType(itineraryType);

        Itinerary savedItinerary =
                itineraryRepository.save(itinerary);

        log.info(
                "Itinerary created: itineraryId={}, userId={}",
                savedItinerary.getItineraryId(),
                userId
        );

        return map(savedItinerary);
    }


    @Transactional
    public void deleteItineraryById(UUID itineraryId) {

        Itinerary itinerary =
                itineraryRepository.findById(itineraryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Itinerary not found."
                                )
                        );

        authorizationService.verifyOwnership(
                itinerary.getCreatedBy().getUserId()
        );

        /*
         * Collect physical file paths before deleting the
         * itinerary and its associated entities.
         */

        List<String> imageFilePaths =
                imageRepository.findByItineraryId(itineraryId)
                        .stream()
                        .map(Image::getFilePath)
                        .filter(Objects::nonNull)
                        .toList();

        String thumbnailFilePath =
                thumbnailRepository
                        .findByItineraryItineraryId(itineraryId)
                        .map(Thumbnail::getFilePath)
                        .orElse(null);

        /*
         * Delete database records.
         *
         * Cascade + orphanRemoval on Itinerary will remove
         * the associated Days, Locations, Images and Thumbnail.
         */
        likedItineraryRepository.deleteByItineraryItineraryId(
                itineraryId
        );

        savedItineraryRepository.deleteByItineraryItineraryId(
                itineraryId
        );

        itineraryRepository.delete(itinerary);

        /*
         * Force the database deletion before deleting physical
         * files. This keeps the database and filesystem cleanup
         * sequence explicit.
         */
        itineraryRepository.flush();

        /*
         * Delete physical image files.
         */
        for (String filePath : imageFilePaths) {

            try {

                fileStorageService.delete(filePath);

            } catch (RuntimeException exception) {

                log.error(
                        "Failed to delete itinerary image file: {}",
                        filePath,
                        exception
                );

                throw exception;
            }
        }

        /*
         * Delete physical thumbnail file.
         */
        if (thumbnailFilePath != null) {

            try {

                fileStorageService.delete(
                        thumbnailFilePath
                );

            } catch (RuntimeException exception) {

                log.error(
                        "Failed to delete itinerary thumbnail file: {}",
                        thumbnailFilePath,
                        exception
                );

                throw exception;
            }
        }

        log.info(
                "Itinerary deleted: itineraryId={}, imagesDeleted={}, thumbnailDeleted={}",
                itineraryId,
                imageFilePaths.size(),
                thumbnailFilePath != null
        );
    }


    @Transactional
    public ItineraryResponseDto updateItinerary(
            ItineraryRequestDto itineraryRequestDto,
            UUID itineraryId
    ) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found.")
                );

        authorizationService.verifyOwnership(
                itinerary.getCreatedBy().getUserId()
        );


        if (itineraryRequestDto.getEndDate()
                .isBefore(itineraryRequestDto.getStartDate())) {

            throw new InvalidOperationException(
                    "End date cannot be before start date."
            );
        }


        ItineraryType itineraryType =
                itineraryTypeRepository.findByName(
                        itineraryRequestDto.getType()
                );

        if (itineraryType == null) {
            throw new ResourceNotFoundException(
                    "Itinerary type not found."
            );
        }


        itinerary.setPlace(itineraryRequestDto.getPlace());
        itinerary.setTitle(itineraryRequestDto.getTitle());
        itinerary.setDescription(itineraryRequestDto.getDescription());
        itinerary.setStartDate(itineraryRequestDto.getStartDate());
        itinerary.setEndDate(itineraryRequestDto.getEndDate());

        itinerary.setTotalDays(
                ChronoUnit.DAYS.between(
                        itineraryRequestDto.getStartDate(),
                        itineraryRequestDto.getEndDate()
                ) + 1
        );

        itinerary.setPublic(itineraryRequestDto.isPublic());
        itinerary.setType(itineraryType);


        Itinerary updatedItinerary =
                itineraryRepository.save(itinerary);


        log.info(
                "Itinerary updated: itineraryId={}",
                itineraryId
        );

        return map(updatedItinerary);
    }


    @Transactional(readOnly = true)
    public Page<ItineraryResponseDto> getItineraries(
            String search,
            String type,
            String sort,
            int page,
            int size
    ) {

        Sort sorting;

        switch (sort) {
            case "likes":
                sorting = Sort.by(
                        Sort.Direction.DESC,
                        "likeCount"
                );
                break;

            case "saves":
                sorting = Sort.by(
                        Sort.Direction.DESC,
                        "saveCount"
                );
                break;

            case "recent":
                sorting = Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                );
                break;

            default:
                sorting = Sort.unsorted();
        }


        Pageable pageable =
                PageRequest.of(page, size, sorting);


        Page<Itinerary> result =
                itineraryRepository.searchItineraries(
                        search.toLowerCase(),
                        type,
                        pageable
                );


        return result.map(this::map);
    }


    @Transactional(readOnly = true)
    public ItineraryResponseDto getItineraryById(UUID itineraryId) {

        Itinerary itinerary =
                itineraryRepository.findById(itineraryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Itinerary not found."
                                )
                        );

        return map(itinerary);
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getAllItinerariesByType(Long typeId) {

        return itineraryRepository.findAllByTypeTypeId(typeId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getAllItinerariesByUserId(UUID userId) {

        return itineraryRepository.findAllByCreatedByUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getAllItinerariesByUserMembership(UUID userId) {

        return itineraryRepository.findAllByMembersUserUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getAllSavedItinerariesByUserId(UUID userId) {

        return itineraryRepository.findAllBySavedByUserUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getMostSavedItineraries() {

        return itineraryRepository.findMostSavedItineraries()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getMostLikedItineraries() {

        return itineraryRepository.findMostLikedItineraries()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

}