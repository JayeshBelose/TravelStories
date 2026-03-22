package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.dto.LocationRequestDto;
import org.travel_stories.dto.LocationResponseDto;
import org.travel_stories.entity.Day;
import org.travel_stories.entity.Location;
import org.travel_stories.repository.DayRepository;
import org.travel_stories.repository.LocationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
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

    public LocationResponseDto addLocation(UUID dayId, LocationRequestDto locationRequestDto){
        Day day = dayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found."));

        int nextLocationNumber = locationRepository.findNextLocationNumber(dayId) + 1;

        Location location = new Location();
        location.setLocationNumber(nextLocationNumber);
        location.setLocationName(locationRequestDto.getLocationName());
        location.setLocationAddress(locationRequestDto.getLocationAddress());
        location.setDay(day);
        locationRepository.save(location);

        return map(location);
    }

    public void removeLocation(UUID dayId, UUID locationId){
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found."));

        dayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found."));

        int deleteLocationNumber = location.getLocationNumber();

        locationRepository.delete(location);
        locationRepository.flush();

        List<Location> locationsToAdjust = locationRepository.findByDayDayIdOrderByLocationNumber(dayId);

        for (Location l : locationsToAdjust){
            if (l.getLocationNumber() > deleteLocationNumber){
                l.setLocationNumber(l.getLocationNumber()-1);
            }
        }

        locationRepository.saveAll(locationsToAdjust);
    }

    public List<LocationResponseDto> getLocationsByDay(UUID dayId){
        List<LocationResponseDto> locations = locationRepository.findByDayDayIdOrderByLocationNumber(dayId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
        return locations;
    }

    public void updateLocation(UUID locationId, LocationRequestDto locationRequestDto){
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found."));

        if (locationRequestDto.getLocationName() != null)
            location.setLocationName(locationRequestDto.getLocationName());
        if (locationRequestDto.getLocationAddress() != null)
            location.setLocationAddress(locationRequestDto.getLocationAddress());
    }

}
