package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.*;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.entity.User;
import org.travel_stories.repository.ImageRepository;
import org.travel_stories.repository.ItineraryRepository;
import org.travel_stories.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ItineraryService itineraryService;
    private final ItineraryRepository itineraryRepository;
    private final ImageRepository imageRepository;


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

    public List<UserResponseDto> getAllUsers() {
        List<UserResponseDto> users = userRepository.findAll()
                .stream()
                .map(user -> {return userService.map(user);})
                .collect(Collectors.toList());

        return users;
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

}
