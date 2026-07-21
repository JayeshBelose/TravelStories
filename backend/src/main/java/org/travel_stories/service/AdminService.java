package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.*;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.ItineraryType;
import org.travel_stories.entity.User;
import org.travel_stories.exception.ResourceAlreadyExistsException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ImageRepository;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.ItineraryTypeRepository;
import org.travel_stories.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ItineraryService itineraryService;
    private final ItineraryRepository itineraryRepository;
    private final ImageRepository imageRepository;
    private final ItineraryTypeService itineraryTypeService;
    private final ItineraryTypeRepository itineraryTypeRepository;


    public AdminStatsDto getStats() {
        return new AdminStatsDto(
                userRepository.count(),
                itineraryRepository.count(),
                imageRepository.count()
        );
    }

    public List<ItineraryResponseDto> getRecentItineraries() {
        return itineraryRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(itinerary -> {return itineraryService.map(itinerary);})
                .collect(Collectors.toList());
    }

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
            users = userRepository.searchUsersForAdmin(search.toLowerCase(), pageable);
        }

        return users.map(userService::map);
    }

    public void deleteUser(UUID userId) {
        userService.deleteUser(userId);
    }

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
                sorting = Sort.by(Sort.Direction.DESC, "likeCount");
                break;
            case "saves":
                sorting = Sort.by(Sort.Direction.DESC, "saveCount");
                break;
            case "recent":
            default:
                sorting = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }

        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<Itinerary> itineraries = itineraryRepository.searchItinerariesAdmin(
                search,
                filter,
                type,
                pageable
        );

        return itineraries.map(itineraryService::map);
    }

    public List<ItineraryTypeDto> getAllTypes() {
        return itineraryTypeService.getAllTypes();
    }

    @Transactional
    public void addType(String name) {

        if (itineraryTypeRepository.existsByNameIgnoreCase(name)) {
            throw new ResourceAlreadyExistsException("Itinerary type already exists.");
        }

        ItineraryType type = new ItineraryType();
        type.setName(name);

        itineraryTypeRepository.save(type);

        log.info("Itinerary type created: {}", name);
    }

    @Transactional
    public void deleteType(Long typeId) {

        ItineraryType type = itineraryTypeRepository.findById(typeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary type not found."));

        itineraryTypeRepository.delete(type);

        log.info("Itinerary type deleted: id={}, name={}", typeId, type.getName());
    }

}
