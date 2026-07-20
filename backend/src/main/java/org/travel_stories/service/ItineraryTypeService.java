package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.entity.ItineraryType;
import org.travel_stories.exception.ResourceAlreadyExistsException;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ItineraryTypeRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryTypeService {

    private final ItineraryTypeRepository itineraryTypeRepository;

    @Transactional
    public ItineraryTypeDto addType(ItineraryTypeDto requestDto) {

        if (itineraryTypeRepository.existsByNameIgnoreCase(requestDto.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Itinerary type already exists."
            );
        }

        ItineraryType itineraryType = new ItineraryType();

        itineraryType.setName(requestDto.getName());

        ItineraryType savedType = itineraryTypeRepository.save(itineraryType);

        ItineraryTypeDto responseDto = new ItineraryTypeDto();

        responseDto.setTypeId(savedType.getTypeId());
        responseDto.setName(savedType.getName());

        return responseDto;
    }

    public List<ItineraryTypeDto> getAllTypes() {

        return itineraryTypeRepository.findAll()
                .stream()
                .map(type -> {

                    ItineraryTypeDto dto = new ItineraryTypeDto();

                    dto.setTypeId(type.getTypeId());
                    dto.setName(type.getName());

                    return dto;

                })
                .toList();
    }

    @Transactional
    public void deleteTypeById(Long typeId) {

        ItineraryType itineraryType =
                itineraryTypeRepository.findById(typeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Itinerary type not found."
                                ));

        itineraryTypeRepository.delete(itineraryType);
    }

}
