package org.travel_stories.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.config.cache.CacheConfig;
import org.travel_stories.dto.admin.response.AdminStatsDto;
import org.travel_stories.dto.admin.response.WeeklyActivityDto;
import org.travel_stories.dto.itinerary.response.ItineraryResponseDto;
import org.travel_stories.dto.itinerary.type.response.ItineraryTypeDto;
import org.travel_stories.dto.user.response.UserResponseDto;
import org.travel_stories.entity.itinerary.Itinerary;
import org.travel_stories.entity.itinerary.ItineraryType;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.resource.ResourceAlreadyExistsException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.ImageRepository;
import org.travel_stories.repository.itinerary.ItineraryRepository;
import org.travel_stories.repository.itinerary.ItineraryTypeRepository;
import org.travel_stories.repository.user.UserRepository;
import org.travel_stories.service.itinerary.ItineraryService;
import org.travel_stories.service.itinerary.ItineraryTypeService;
import org.travel_stories.service.user.UserService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ItineraryService itineraryService;
    private final ItineraryRepository itineraryRepository;
    private final ImageRepository imageRepository;
    private final ItineraryTypeService itineraryTypeService;
    private final ItineraryTypeRepository itineraryTypeRepository;


    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        return new AdminStatsDto(
                userRepository.count(),
                itineraryRepository.count(),
                imageRepository.count()
        );
    }


    @Transactional(readOnly = true)
    public List<ItineraryResponseDto> getRecentItineraries() {
        return itineraryRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(itineraryService::map)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<WeeklyActivityDto> getWeeklyActivity() {
        LocalDate today = LocalDate.now();
        List<WeeklyActivityDto> result = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {

            LocalDate date = today.minusDays(i);

            long users = userRepository.countByCreatedAt(date);
            long itineraries = itineraryRepository.countByCreatedAt(date);

            result.add(new WeeklyActivityDto(
                    date.toString(),
                    users,
                    itineraries
            ));
        }

        return result;
    }


    public void deleteItinerary(UUID itineraryId) {
        itineraryService.deleteItineraryById(itineraryId);
    }


    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(
            String search,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<User> users;

        if (search == null || search.isBlank()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.searchUsersForAdmin(
                    search.toLowerCase(),
                    pageable
            );
        }

        List<UserResponseDto> userDtos =
                userService.mapUsers(users.getContent());

        return new PageImpl<>(
                userDtos,
                users.getPageable(),
                users.getTotalElements()
        );
    }


    public void deleteUser(UUID userId) {
        userService.deleteUserAsAdmin(userId);
    }


    @Transactional(readOnly = true)
    public Page<ItineraryResponseDto> getAllItineraries(
            int page,
            int size,
            String search,
            String filter,
            String type,
            String sort
    ) {

        if (search == null) search = "";
        if (filter == null) filter = "ALL";
        if (type == null) type = "all";
        if (sort == null) sort = "recent";

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
            default:
                sorting = Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                );
                break;
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                sorting
        );

        Page<Itinerary> itineraries =
                itineraryRepository.searchItinerariesAdmin(
                        search,
                        filter,
                        type,
                        pageable
                );

        return itineraries.map(itineraryService::map);
    }


    @Cacheable(
            cacheNames = CacheConfig.ITINERARY_TYPES_CACHE,
            key = "'all'"
    )
    @Transactional(readOnly = true)
    public List<ItineraryTypeDto> getAllTypes() {
        return itineraryTypeService.getAllTypes();
    }


    @CacheEvict(
            cacheNames = CacheConfig.ITINERARY_TYPES_CACHE,
            allEntries = true
    )
    @Transactional
    public void addType(String name) {

        if (itineraryTypeRepository.existsByNameIgnoreCase(name)) {

            log.warn(
                    "Failed to create itinerary type. Type '{}' already exists.",
                    name
            );

            throw new ResourceAlreadyExistsException(
                    "Itinerary type already exists."
            );
        }

        ItineraryType type = new ItineraryType();
        type.setName(name);

        itineraryTypeRepository.save(type);

        log.info(
                "Itinerary type created: {}",
                name
        );
    }


    @CacheEvict(
            cacheNames = CacheConfig.ITINERARY_TYPES_CACHE,
            allEntries = true
    )
    @Transactional
    public void deleteType(Long typeId) {

        ItineraryType type =
                itineraryTypeRepository.findById(typeId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Failed to delete itinerary type. Type not found: id={}",
                                    typeId
                            );

                            return new ResourceNotFoundException(
                                    "Itinerary type not found."
                            );
                        });


        itineraryTypeRepository.delete(type);

        log.info(
                "Itinerary type deleted: id={}, name={}",
                typeId,
                type.getName()
        );
    }

}