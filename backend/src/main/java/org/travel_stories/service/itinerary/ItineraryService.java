package org.travel_stories.service.itinerary;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.itinerary.response.ItineraryListResponseDto;
import org.travel_stories.dto.itinerary.request.ItineraryRequestDto;
import org.travel_stories.dto.itinerary.response.ItineraryResponseDto;
import org.travel_stories.dto.itinerary.response.MemberResponseDto;
import org.travel_stories.entity.itinerary.Image;
import org.travel_stories.entity.itinerary.Itinerary;
import org.travel_stories.entity.itinerary.ItineraryType;
import org.travel_stories.entity.itinerary.Thumbnail;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.*;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.security.auth.AuthorizationService;
import org.travel_stories.service.storage.StorageService;

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
    private final StorageService storageService;

    private static final int MAX_USER_ITINERARY_PAGE_SIZE = 15;

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

    public ItineraryListResponseDto mapToListResponse(Itinerary itinerary) {

        ItineraryListResponseDto dto = new ItineraryListResponseDto();

        dto.setItineraryId(itinerary.getItineraryId());
        dto.setPlace(itinerary.getPlace());
        dto.setTitle(itinerary.getTitle());
        dto.setStartDate(itinerary.getStartDate());
        dto.setEndDate(itinerary.getEndDate());
        dto.setPublic(itinerary.isPublic());
        dto.setLikeCount(itinerary.getLikeCount());
        dto.setSaveCount(itinerary.getSaveCount());
        dto.setCreatedBy(itinerary.getCreatedBy().getUsername());
        dto.setType(itinerary.getType().getName());

        return dto;
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
         * Delete database records that are not handled
         * automatically by the Itinerary cascade.
         *
         * Thumbnail is deleted explicitly because its
         * relationship does not use cascade/orphanRemoval.
         */
        likedItineraryRepository.deleteByItineraryItineraryId(
                itineraryId
        );

        savedItineraryRepository.deleteByItineraryItineraryId(
                itineraryId
        );

        thumbnailRepository.deleteByItineraryItineraryId(
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

                storageService.delete(filePath);

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

                storageService.delete(
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
    public Page<ItineraryListResponseDto> getItineraries(
            String search,
            String type,
            String sort,
            int page,
            int size
    ) {

        Sort sorting = switch (sort) {
            case "likes" -> Sort.by(
                    Sort.Order.desc("likeCount"),
                    Sort.Order.desc("createdAt"),
                    Sort.Order.asc("itineraryId")
            );

            case "saves" -> Sort.by(
                    Sort.Order.desc("saveCount"),
                    Sort.Order.desc("createdAt"),
                    Sort.Order.asc("itineraryId")
            );

            case "recent" -> Sort.by(
                    Sort.Order.desc("createdAt"),
                    Sort.Order.asc("itineraryId")
            );

            default -> Sort.by(
                    Sort.Order.desc("createdAt"),
                    Sort.Order.asc("itineraryId")
            );
        };

        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<Itinerary> result =
                itineraryRepository.searchItineraries(
                        search.toLowerCase(),
                        type,
                        pageable
                );

        return result.map(this::mapToListResponse);
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
    public List<ItineraryListResponseDto> getAllItinerariesByType(Long typeId) {

        return itineraryRepository.findAllByTypeTypeId(typeId)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public Page<ItineraryListResponseDto> getAllItinerariesByUserId(
            UUID userId,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);

        int safeSize = Math.clamp(
                size,
                1,
                MAX_USER_ITINERARY_PAGE_SIZE
        );

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.asc("itineraryId")
                )
        );

        return itineraryRepository
                .findAllByCreatedByUserId(userId, pageable)
                .map(this::mapToListResponse);
    }


    @Transactional(readOnly = true)
    public Page<ItineraryListResponseDto> getAllItinerariesByUserMembership(
            UUID userId,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);

        int safeSize = Math.clamp(
                size,
                1,
                MAX_USER_ITINERARY_PAGE_SIZE
        );

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.asc("itineraryId")
                )
        );

        return itineraryRepository
                .findAllByMemberUserId(userId, pageable)
                .map(this::mapToListResponse);
    }


    @Transactional(readOnly = true)
    public Page<ItineraryListResponseDto> getAllSavedItinerariesByUserId(
            UUID userId,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);

        int safeSize = Math.clamp(
                size,
                1,
                MAX_USER_ITINERARY_PAGE_SIZE
        );

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.asc("itineraryId")
                )
        );

        return itineraryRepository
                .findAllBySavedUserId(userId, pageable)
                .map(this::mapToListResponse);
    }


    @Transactional(readOnly = true)
    public List<ItineraryListResponseDto> getMostSavedItineraries() {

        return itineraryRepository.findMostSavedItineraries()
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<ItineraryListResponseDto> getMostLikedItineraries() {

        return itineraryRepository.findMostLikedItineraries()
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

}