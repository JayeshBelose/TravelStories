package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.travel_stories.security.AuthorizationService;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DayService {

    private final DayRepository dayRepository;
    private final ItineraryRepository itineraryRepository;
    private final AuthorizationService authorizationService;


    public DayResponseDto map(Day day) {

        DayResponseDto dayResponseDto = new DayResponseDto();

        dayResponseDto.setDayId(day.getDayId());
        dayResponseDto.setDayNumber(day.getDayNumber());
        dayResponseDto.setDescription(day.getDescription());

        return dayResponseDto;
    }


    @Transactional
    public DayResponseDto addDay(
            UUID itineraryId,
            DayRequestDto dayRequestDto
    ) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed to add day. Itinerary not found: {}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Itinerary not found."
                    );
                });

        authorizationService.verifyOwnership(
                itinerary.getCreatedBy().getUserId()
        );

        int nextDayNumber =
                dayRepository.findMaxDayNumber(itineraryId) + 1;


        if (nextDayNumber > itinerary.getTotalDays()) {

            log.warn(
                    "Failed to add day. Itinerary {} already has maximum {} days.",
                    itineraryId,
                    itinerary.getTotalDays()
            );

            throw new InvalidOperationException(
                    "Cannot add more days than the itinerary total."
            );
        }


        Day day = new Day();

        day.setDayNumber(nextDayNumber);
        day.setDescription(dayRequestDto.getDescription());
        day.setItinerary(itinerary);


        dayRepository.save(day);


        log.info(
                "Day {} added to itinerary {}",
                day.getDayNumber(),
                itineraryId
        );


        return map(day);
    }


    @Transactional
    public void removeDay(
            UUID itineraryId,
            UUID dayId
    ) {

        Day day = dayRepository.findById(dayId)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed to remove day. Day not found: {}",
                            dayId
                    );

                    return new ResourceNotFoundException(
                            "Day not found."
                    );
                });


        itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed to remove day. Itinerary not found: {}",
                            itineraryId
                    );

                    return new ResourceNotFoundException(
                            "Itinerary not found."
                    );
                });

        authorizationService.verifyOwnership(
                day.getItinerary().getCreatedBy().getUserId()
        );

        if (!day.getItinerary().getItineraryId().equals(itineraryId)) {

            throw new ResourceNotFoundException(
                    "Day does not belong to the specified itinerary."
            );
        }

        int deletedDayNumber = day.getDayNumber();


        dayRepository.delete(day);
        dayRepository.flush();


        List<Day> daysToAdjust =
                dayRepository.findByItineraryItineraryIdOrderByDayNumber(
                        itineraryId
                );


        for (Day d : daysToAdjust) {

            if (d.getDayNumber() > deletedDayNumber) {
                d.setDayNumber(
                        d.getDayNumber() - 1
                );
            }
        }


        dayRepository.saveAll(daysToAdjust);


        log.info(
                "Day {} removed from itinerary {}",
                deletedDayNumber,
                itineraryId
        );
    }


    @Transactional(readOnly = true)
    public List<DayResponseDto> getDaysByItinerary(
            UUID itineraryId
    ) {

        return dayRepository
                .findByItineraryItineraryIdOrderByDayNumber(itineraryId)
                .stream()
                .map(this::map)
                .toList();
    }


    @Transactional
    public void updateDay(
            UUID dayId,
            DayRequestDto dayRequestDto
    ) {

        Day day = dayRepository.findById(dayId)
                .orElseThrow(() -> {

                    log.warn(
                            "Failed to update day. Day not found: {}",
                            dayId
                    );

                    return new ResourceNotFoundException(
                            "Day not found."
                    );
                });

        authorizationService.verifyOwnership(
                day.getItinerary().getCreatedBy().getUserId()
        );


        if (dayRequestDto.getDescription() != null) {
            day.setDescription(
                    dayRequestDto.getDescription()
            );
        }


        log.info(
                "Day {} updated for itinerary {}",
                dayId,
                day.getItinerary().getItineraryId()
        );
    }

}