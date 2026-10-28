package org.travel_stories.service.itinerary;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.travel_stories.dto.itinerary.type.response.ItineraryTypeDto;
import org.travel_stories.entity.itinerary.ItineraryType;
import org.travel_stories.exception.resource.ResourceAlreadyExistsException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.ItineraryTypeRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItineraryTypeServiceTest {

    @Mock
    private ItineraryTypeRepository itineraryTypeRepository;

    @InjectMocks
    private ItineraryTypeService itineraryTypeService;

    private Long typeId;
    private ItineraryType itineraryType;

    @BeforeEach
    void setUp() {
        typeId = 1L;
        itineraryType = mock(ItineraryType.class);
    }

    // ============================================================
    // addType()
    // ============================================================

    @Test
    void addType_ShouldCreateType_WhenNameDoesNotExist() {

        ItineraryTypeDto requestDto = new ItineraryTypeDto();
        requestDto.setName("Adventure");

        when(itineraryTypeRepository.existsByNameIgnoreCase("Adventure"))
                .thenReturn(false);

        when(itineraryTypeRepository.save(any(ItineraryType.class)))
                .thenReturn(itineraryType);

        when(itineraryType.getTypeId()).thenReturn(typeId);
        when(itineraryType.getName()).thenReturn("Adventure");

        ItineraryTypeDto result =
                itineraryTypeService.addType(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getTypeId()).isEqualTo(typeId);
        assertThat(result.getName()).isEqualTo("Adventure");

        ArgumentCaptor<ItineraryType> captor =
                ArgumentCaptor.forClass(ItineraryType.class);

        verify(itineraryTypeRepository).save(captor.capture());

        ItineraryType savedType = captor.getValue();

        assertThat(savedType.getName()).isEqualTo("Adventure");

        verify(itineraryTypeRepository)
                .existsByNameIgnoreCase("Adventure");

        verifyNoMoreInteractions(itineraryTypeRepository);
    }

    @Test
    void addType_ShouldThrowException_WhenNameAlreadyExists() {

        ItineraryTypeDto requestDto = new ItineraryTypeDto();
        requestDto.setName("Adventure");

        when(itineraryTypeRepository.existsByNameIgnoreCase("Adventure"))
                .thenReturn(true);

        assertThatThrownBy(() ->
                itineraryTypeService.addType(requestDto)
        )
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage("Itinerary type already exists.");

        verify(itineraryTypeRepository)
                .existsByNameIgnoreCase("Adventure");

        verify(itineraryTypeRepository, never())
                .save(any(ItineraryType.class));
    }

    // ============================================================
    // getAllTypes()
    // ============================================================

    @Test
    void getAllTypes_ShouldReturnMappedDtos() {
        when(itineraryType.getTypeId()).thenReturn(1L);
        when(itineraryType.getName()).thenReturn("Adventure");

        ItineraryType secondType = mock(ItineraryType.class);

        when(secondType.getTypeId()).thenReturn(2L);
        when(secondType.getName()).thenReturn("Family");

        when(itineraryTypeRepository.findAll())
                .thenReturn(List.of(itineraryType, secondType));

        List<ItineraryTypeDto> result =
                itineraryTypeService.getAllTypes();

        assertThat(result)
                .hasSize(2);

        assertThat(result.get(0).getTypeId())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("Adventure");

        assertThat(result.get(1).getTypeId())
                .isEqualTo(2L);

        assertThat(result.get(1).getName())
                .isEqualTo("Family");

        verify(itineraryTypeRepository).findAll();
    }

    @Test
    void getAllTypes_ShouldReturnEmptyList_WhenNoTypesExist() {

        when(itineraryTypeRepository.findAll())
                .thenReturn(List.of());

        List<ItineraryTypeDto> result =
                itineraryTypeService.getAllTypes();

        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(itineraryTypeRepository).findAll();
    }

    // ============================================================
    // deleteTypeById()
    // ============================================================

    @Test
    void deleteTypeById_ShouldDeleteType_WhenTypeExists() {

        when(itineraryTypeRepository.findById(typeId))
                .thenReturn(Optional.of(itineraryType));

        when(itineraryType.getTypeId()).thenReturn(typeId);
        when(itineraryType.getName()).thenReturn("Adventure");

        itineraryTypeService.deleteTypeById(typeId);

        verify(itineraryTypeRepository)
                .findById(typeId);

        verify(itineraryTypeRepository)
                .delete(itineraryType);

        verifyNoMoreInteractions(itineraryTypeRepository);
    }

    @Test
    void deleteTypeById_ShouldThrowException_WhenTypeDoesNotExist() {

        when(itineraryTypeRepository.findById(typeId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                itineraryTypeService.deleteTypeById(typeId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary type not found.");

        verify(itineraryTypeRepository)
                .findById(typeId);

        verify(itineraryTypeRepository, never())
                .delete(any(ItineraryType.class));
    }
}