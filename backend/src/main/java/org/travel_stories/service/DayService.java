package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.DayRequestDto;
import org.travel_stories.dto.DayResponseDto;
import org.travel_stories.entity.Day;
import org.travel_stories.entity.Itinerary;
import org.travel_stories.exception.InvalidOperationException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.DayRepository;
import org.travel_stories.repository.ItineraryRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DayService {

    private final DayRepository dayRepository;
    private final ItineraryRepository itineraryRepository;

    public DayResponseDto map(Day day){
        DayResponseDto dayResponseDto = new DayResponseDto();
        dayResponseDto.setDayId(day.getDayId());
        dayResponseDto.setDayNumber(day.getDayNumber());
        dayResponseDto.setDescription(day.getDescription());

        return dayResponseDto;
    }

    @Transactional
    public DayResponseDto addDay(UUID itineraryId, DayRequestDto dayRequestDto) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found."));

        int nextDayNumber = dayRepository.findMaxDayNumber(itineraryId) + 1;

        if (nextDayNumber > itinerary.getTotalDays()) {
            throw new InvalidOperationException(
                    "Cannot add more days than the itinerary total."
            );
        }

        Day day = new Day();
        day.setDayNumber(nextDayNumber);
        day.setDescription(dayRequestDto.getDescription());
        day.setItinerary(itinerary);

        dayRepository.save(day);

        return map(day);
    }

    @Transactional
    public void removeDay(UUID itineraryId, UUID dayId) {

        Day day = dayRepository.findById(dayId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Day not found."));

        itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found."));

        int deletedDayNumber = day.getDayNumber();

        dayRepository.delete(day);
        dayRepository.flush();

        List<Day> daysToAdjust =
                dayRepository.findByItineraryItineraryIdOrderByDayNumber(itineraryId);

        for (Day d : daysToAdjust) {
            if (d.getDayNumber() > deletedDayNumber) {
                d.setDayNumber(d.getDayNumber() - 1);
            }
        }

        dayRepository.saveAll(daysToAdjust);
    }

    public List<DayResponseDto> getDaysByItinerary(UUID itineraryId) {

        return dayRepository.findByItineraryItineraryIdOrderByDayNumber(itineraryId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public void updateDay(UUID dayId, DayRequestDto dayRequestDto) {

        Day day = dayRepository.findById(dayId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Day not found."));

        if (dayRequestDto.getDescription() != null) {
            day.setDescription(dayRequestDto.getDescription());
        }
    }

}
