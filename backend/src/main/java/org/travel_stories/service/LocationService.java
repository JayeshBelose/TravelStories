package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.LocationRequestDto;
import org.travel_stories.dto.LocationResponseDto;
import org.travel_stories.entity.Day;
import org.travel_stories.entity.Location;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.DayRepository;
import org.travel_stories.repository.LocationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final DayRepository dayRepository;
    private final ImageService imageService;

    public LocationResponseDto map(Location location){
        LocationResponseDto locationResponseDto = new LocationResponseDto();
        locationResponseDto.setLocationId(location.getLocationId());
        locationResponseDto.setLocationNumber(location.getLocationNumber());
        locationResponseDto.setLocationName(location.getLocationName());
        locationResponseDto.setLocationAddress(location.getLocationAddress());

        return locationResponseDto;
    }

    @Transactional
    public LocationResponseDto addLocation(
            UUID dayId,
            LocationRequestDto locationRequestDto
    ) {

        Day day = dayRepository.findById(dayId)
                .orElseThrow(() -> {
                    log.warn("Failed to add location: day not found, dayId={}", dayId);
                    return new ResourceNotFoundException("Day not found.");
                });

        int nextLocationNumber =
                locationRepository.findNextLocationNumber(dayId) + 1;

        Location location = new Location();

        location.setLocationNumber(nextLocationNumber);
        location.setLocationName(locationRequestDto.getLocationName());
        location.setLocationAddress(locationRequestDto.getLocationAddress());
        location.setDay(day);

        locationRepository.save(location);

        log.info(
                "Location added: locationId={}, dayId={}, orderNumber={}",
                location.getLocationId(),
                dayId,
                nextLocationNumber
        );

        return map(location);
    }

    @Transactional
    public void removeLocation(UUID dayId, UUID locationId) {

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> {
                    log.warn("Failed to remove location: location not found, locationId={}", locationId);
                    return new ResourceNotFoundException(
                            "Location not found."
                    );
                });

        dayRepository.findById(dayId)
                .orElseThrow(() -> {
                    log.warn("Failed to remove location: day not found, dayId={}", dayId);
                    return new ResourceNotFoundException(
                            "Day not found."
                    );
                });

        int deletedLocationNumber = location.getLocationNumber();

        locationRepository.delete(location);
        locationRepository.flush();

        List<Location> locationsToAdjust =
                locationRepository.findByDayDayIdOrderByLocationNumber(dayId);

        for (Location l : locationsToAdjust) {

            if (l.getLocationNumber() > deletedLocationNumber) {
                l.setLocationNumber(
                        l.getLocationNumber() - 1
                );
            }
        }

        locationRepository.saveAll(locationsToAdjust);

        log.info(
                "Location removed: locationId={}, dayId={}, orderNumber={}",
                locationId,
                dayId,
                deletedLocationNumber
        );
    }

    @Transactional
    public List<LocationResponseDto> getLocationsByDay(UUID dayId) {

        return locationRepository
                .findByDayDayIdOrderByLocationNumber(dayId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public void updateLocation(
            UUID locationId,
            LocationRequestDto locationRequestDto
    ) {

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> {
                    log.warn("Failed to update location: location not found, locationId={}", locationId);
                    return new ResourceNotFoundException(
                            "Location not found."
                    );
                });

        if (locationRequestDto.getLocationName() != null) {
            location.setLocationName(
                    locationRequestDto.getLocationName()
            );
        }

        if (locationRequestDto.getLocationAddress() != null) {
            location.setLocationAddress(
                    locationRequestDto.getLocationAddress()
            );
        }

        log.info(
                "Location updated: locationId={}, dayId={}",
                locationId,
                location.getDay().getDayId()
        );
    }

}
