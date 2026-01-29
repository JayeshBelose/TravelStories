package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.travel_stories.dto.ItineraryTypeDto;
import org.travel_stories.entity.ItineraryType;
import org.travel_stories.repository.ItineraryTypeRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryTypeService {

    private final ItineraryTypeRepository itineraryTypeRepository;

    public ItineraryTypeDto addType(ItineraryTypeDto requestDto){
        ItineraryType itineraryType = new ItineraryType();

        itineraryType.setName(requestDto.getName());
        ItineraryType savedType = itineraryTypeRepository.save(itineraryType);

        ItineraryTypeDto responseDto = new ItineraryTypeDto();

        responseDto.setName(savedType.getName());
        return responseDto;
    }

    public List<ItineraryTypeDto> getAllTypes(){
        return itineraryTypeRepository.findAll()
                .stream()
                .map(t -> {
                    ItineraryTypeDto itineraryTypeDto = new ItineraryTypeDto();
                    itineraryTypeDto.setName(t.getName());
                    return itineraryTypeDto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTypeByName(String name){
        itineraryTypeRepository.deleteByName(name);
    }

}
