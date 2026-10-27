package org.travel_stories.service.itinerary;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.travel_stories.dto.itinerary.request.ItineraryRequestDto;
import org.travel_stories.dto.itinerary.response.ItineraryListResponseDto;
import org.travel_stories.dto.itinerary.response.ItineraryResponseDto;
import org.travel_stories.entity.itinerary.Image;
import org.travel_stories.entity.itinerary.Itinerary;
import org.travel_stories.entity.itinerary.ItineraryMember;
import org.travel_stories.entity.itinerary.ItineraryType;
import org.travel_stories.entity.itinerary.Thumbnail;
import org.travel_stories.entity.user.User;
import org.travel_stories.exception.operation.InvalidOperationException;
import org.travel_stories.exception.resource.ResourceNotFoundException;
import org.travel_stories.repository.itinerary.ImageRepository;
import org.travel_stories.repository.itinerary.ItineraryRepository;
import org.travel_stories.repository.itinerary.ItineraryTypeRepository;
import org.travel_stories.repository.itinerary.LikedItineraryRepository;
import org.travel_stories.repository.itinerary.SavedItineraryRepository;
import org.travel_stories.repository.itinerary.ThumbnailRepository;
import org.travel_stories.security.auth.AuthorizationService;
import org.travel_stories.service.storage.StorageService;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItineraryServiceTest {

    @Mock
    private ItineraryRepository itineraryRepository;

    @Mock
    private org.travel_stories.repository.user.UserRepository userRepository;

    @Mock
    private ItineraryTypeRepository itineraryTypeRepository;

    @Mock
    private LikedItineraryRepository likedItineraryRepository;

    @Mock
    private SavedItineraryRepository savedItineraryRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private ThumbnailRepository thumbnailRepository;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private ItineraryService itineraryService;

    private UUID itineraryId;
    private UUID userId;

    private User user;
    private User memberUser;
    private ItineraryType itineraryType;
    private Itinerary itinerary;

    @BeforeEach
    void setUp() {
        itineraryId = UUID.randomUUID();
        userId = UUID.randomUUID();

        user = new User();
        user.setUserId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        memberUser = new User();
        memberUser.setUserId(UUID.randomUUID());
        memberUser.setUsername("memberuser");

        itineraryType = new ItineraryType();
        itineraryType.setTypeId(1L);
        itineraryType.setName("Adventure");

        itinerary = new Itinerary();
        itinerary.setItineraryId(itineraryId);
        itinerary.setPlace("Shimla");
        itinerary.setTitle("Shimla Adventure");
        itinerary.setDescription("A mountain trip");
        itinerary.setStartDate(LocalDate.of(2026, 1, 10));
        itinerary.setEndDate(LocalDate.of(2026, 1, 12));
        itinerary.setTotalDays(3L);
        itinerary.setPublic(true);
        itinerary.setLikeCount(10);
        itinerary.setSaveCount(5);
        itinerary.setCreatedAt(Instant.parse("2026-01-01T10:00:00Z"));
        itinerary.setLastUpdated(Instant.parse("2026-01-02T10:00:00Z"));
        itinerary.setCreatedBy(user);
        itinerary.setType(itineraryType);
    }

    // ---------------------------------------------------------
    // Mapping
    // ---------------------------------------------------------

    @Test
    void shouldMapItineraryToResponseDto() {
        ItineraryMember member = new ItineraryMember();
        member.setUser(memberUser);

        itinerary.setMembers(List.of(member));

        ItineraryResponseDto result = itineraryService.map(itinerary);

        assertThat(result.getItineraryId()).isEqualTo(itineraryId);
        assertThat(result.getPlace()).isEqualTo("Shimla");
        assertThat(result.getTitle()).isEqualTo("Shimla Adventure");
        assertThat(result.getDescription()).isEqualTo("A mountain trip");
        assertThat(result.getStartDate()).isEqualTo(LocalDate.of(2026, 1, 10));
        assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2026, 1, 12));
        assertThat(result.getTotalDays()).isEqualTo(3L);
        assertThat(result.isPublic()).isTrue();
        assertThat(result.getLikeCount()).isEqualTo(10);
        assertThat(result.getSaveCount()).isEqualTo(5);
        assertThat(result.getCreatedBy()).isEqualTo("testuser");
        assertThat(result.getType()).isEqualTo("Adventure");
        assertThat(result.getMembers()).hasSize(1);
        assertThat(result.getMembers().get(0).getUsername())
                .isEqualTo("memberuser");
        assertThat(result.getMembers().get(0).getUserId())
                .isEqualTo(memberUser.getUserId());
    }

    @Test
    void shouldMapItineraryToListResponseDto() {
        ItineraryListResponseDto result =
                itineraryService.mapToListResponse(itinerary);

        assertThat(result.getItineraryId()).isEqualTo(itineraryId);
        assertThat(result.getPlace()).isEqualTo("Shimla");
        assertThat(result.getTitle()).isEqualTo("Shimla Adventure");
        assertThat(result.getStartDate())
                .isEqualTo(LocalDate.of(2026, 1, 10));
        assertThat(result.getEndDate())
                .isEqualTo(LocalDate.of(2026, 1, 12));
        assertThat(result.getTotalDays()).isEqualTo(3L);
        assertThat(result.isPublic()).isTrue();
        assertThat(result.getLikeCount()).isEqualTo(10);
        assertThat(result.getSaveCount()).isEqualTo(5);
        assertThat(result.getCreatedBy()).isEqualTo("testuser");
        assertThat(result.getType()).isEqualTo("Adventure");
    }

    // ---------------------------------------------------------
    // Create
    // ---------------------------------------------------------

    @Test
    void shouldCreateItinerarySuccessfully() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setPlace("Manali");
        request.setTitle("Manali Trip");
        request.setDescription("Mountain vacation");
        request.setStartDate(LocalDate.of(2026, 2, 10));
        request.setEndDate(LocalDate.of(2026, 2, 12));
        request.setPublic(true);
        request.setType("Adventure");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(itineraryTypeRepository.findByName("Adventure"))
                .thenReturn(itineraryType);

        when(itineraryRepository.save(any(Itinerary.class)))
                .thenAnswer(invocation -> {
                    Itinerary saved = invocation.getArgument(0);
                    saved.setItineraryId(itineraryId);
                    saved.setLikeCount(0);
                    saved.setSaveCount(0);
                    saved.setCreatedAt(Instant.now());
                    saved.setLastUpdated(Instant.now());
                    return saved;
                });

        ItineraryResponseDto result =
                itineraryService.createItinerary(request, userId);

        assertThat(result.getItineraryId()).isEqualTo(itineraryId);
        assertThat(result.getPlace()).isEqualTo("Manali");
        assertThat(result.getTitle()).isEqualTo("Manali Trip");
        assertThat(result.getTotalDays()).isEqualTo(3L);
        assertThat(result.isPublic()).isTrue();
        assertThat(result.getCreatedBy()).isEqualTo("testuser");
        assertThat(result.getType()).isEqualTo("Adventure");

        verify(authorizationService).verifyOwnership(userId);
        verify(userRepository).findById(userId);
        verify(itineraryTypeRepository).findByName("Adventure");
        verify(itineraryRepository).save(any(Itinerary.class));
    }

    @Test
    void shouldCalculateTotalDaysInclusivelyWhenCreatingItinerary() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setPlace("Pune");
        request.setTitle("Weekend Trip");
        request.setStartDate(LocalDate.of(2026, 3, 1));
        request.setEndDate(LocalDate.of(2026, 3, 3));
        request.setPublic(true);
        request.setType("Adventure");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(itineraryTypeRepository.findByName("Adventure"))
                .thenReturn(itineraryType);

        when(itineraryRepository.save(any(Itinerary.class)))
                .thenAnswer(invocation -> {
                    Itinerary saved = invocation.getArgument(0);
                    saved.setItineraryId(itineraryId);
                    saved.setLikeCount(0);
                    saved.setSaveCount(0);
                    saved.setCreatedAt(Instant.now());
                    saved.setLastUpdated(Instant.now());
                    return saved;
                });

        itineraryService.createItinerary(request, userId);

        ArgumentCaptor<Itinerary> captor =
                ArgumentCaptor.forClass(Itinerary.class);

        verify(itineraryRepository).save(captor.capture());

        assertThat(captor.getValue().getTotalDays())
                .isEqualTo(3L);
    }

    @Test
    void shouldRejectCreateWhenEndDateIsBeforeStartDate() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setStartDate(LocalDate.of(2026, 3, 10));
        request.setEndDate(LocalDate.of(2026, 3, 5));

        assertThatThrownBy(() ->
                itineraryService.createItinerary(request, userId)
        )
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("End date cannot be before start date.");

        verifyNoInteractions(authorizationService);
        verifyNoInteractions(userRepository);
        verifyNoInteractions(itineraryRepository);
    }

    @Test
    void shouldRejectCreateWhenUserDoesNotExist() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setStartDate(LocalDate.of(2026, 3, 1));
        request.setEndDate(LocalDate.of(2026, 3, 3));
        request.setType("Adventure");

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                itineraryService.createItinerary(request, userId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found.");

        verify(authorizationService).verifyOwnership(userId);
        verify(userRepository).findById(userId);
        verifyNoInteractions(itineraryTypeRepository);
        verify(itineraryRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenItineraryTypeDoesNotExist() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setStartDate(LocalDate.of(2026, 3, 1));
        request.setEndDate(LocalDate.of(2026, 3, 3));
        request.setType("Unknown");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(itineraryTypeRepository.findByName("Unknown"))
                .thenReturn(null);

        assertThatThrownBy(() ->
                itineraryService.createItinerary(request, userId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary type not found.");

        verify(itineraryTypeRepository).findByName("Unknown");
        verify(itineraryRepository, never()).save(any());
    }

    // ---------------------------------------------------------
    // Update
    // ---------------------------------------------------------

    @Test
    void shouldUpdateItinerarySuccessfully() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setPlace("Manali");
        request.setTitle("Updated Trip");
        request.setDescription("Updated description");
        request.setStartDate(LocalDate.of(2026, 4, 10));
        request.setEndDate(LocalDate.of(2026, 4, 14));
        request.setPublic(false);
        request.setType("Adventure");

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(itineraryTypeRepository.findByName("Adventure"))
                .thenReturn(itineraryType);

        when(itineraryRepository.save(itinerary))
                .thenReturn(itinerary);

        ItineraryResponseDto result =
                itineraryService.updateItinerary(request, itineraryId);

        assertThat(result.getPlace()).isEqualTo("Manali");
        assertThat(result.getTitle()).isEqualTo("Updated Trip");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        assertThat(result.getStartDate())
                .isEqualTo(LocalDate.of(2026, 4, 10));
        assertThat(result.getEndDate())
                .isEqualTo(LocalDate.of(2026, 4, 14));
        assertThat(result.getTotalDays()).isEqualTo(5L);
        assertThat(result.isPublic()).isFalse();

        verify(itineraryRepository).findById(itineraryId);
        verify(authorizationService).verifyOwnership(userId);
        verify(itineraryTypeRepository).findByName("Adventure");
        verify(itineraryRepository).save(itinerary);
    }

    @Test
    void shouldRejectUpdateWhenItineraryDoesNotExist() {
        ItineraryRequestDto request = new ItineraryRequestDto();

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                itineraryService.updateItinerary(request, itineraryId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary not found.");

        verify(itineraryRepository).findById(itineraryId);
        verifyNoInteractions(authorizationService);
        verifyNoInteractions(itineraryTypeRepository);
    }

    @Test
    void shouldRejectUpdateWhenEndDateIsBeforeStartDate() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setStartDate(LocalDate.of(2026, 4, 10));
        request.setEndDate(LocalDate.of(2026, 4, 5));

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        assertThatThrownBy(() ->
                itineraryService.updateItinerary(request, itineraryId)
        )
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("End date cannot be before start date.");

        verify(authorizationService).verifyOwnership(userId);
        verifyNoInteractions(itineraryTypeRepository);
        verify(itineraryRepository, never()).save(any());
    }

    @Test
    void shouldRejectUpdateWhenItineraryTypeDoesNotExist() {
        ItineraryRequestDto request = new ItineraryRequestDto();
        request.setStartDate(LocalDate.of(2026, 4, 10));
        request.setEndDate(LocalDate.of(2026, 4, 12));
        request.setType("Unknown");

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(itineraryTypeRepository.findByName("Unknown"))
                .thenReturn(null);

        assertThatThrownBy(() ->
                itineraryService.updateItinerary(request, itineraryId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary type not found.");

        verify(authorizationService).verifyOwnership(userId);
        verify(itineraryTypeRepository).findByName("Unknown");
        verify(itineraryRepository, never()).save(any());
    }

    // ---------------------------------------------------------
    // Delete
    // ---------------------------------------------------------

    @Test
    void shouldDeleteItineraryAndAssociatedFiles() {
        Image image1 = mock(Image.class);
        Image image2 = mock(Image.class);
        Thumbnail thumbnail = mock(Thumbnail.class);

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(imageRepository.findByItineraryId(itineraryId))
                .thenReturn(List.of(image1, image2));

        when(image1.getFilePath()).thenReturn("images/image1.jpg");
        when(image2.getFilePath()).thenReturn("images/image2.jpg");

        when(thumbnailRepository.findByItineraryItineraryId(itineraryId))
                .thenReturn(Optional.of(thumbnail));

        when(thumbnail.getFilePath())
                .thenReturn("thumbnails/thumbnail.jpg");

        itineraryService.deleteItineraryById(itineraryId);

        verify(itineraryRepository).findById(itineraryId);
        verify(authorizationService).verifyOwnership(userId);

        verify(imageRepository).findByItineraryId(itineraryId);
        verify(thumbnailRepository)
                .findByItineraryItineraryId(itineraryId);

        verify(likedItineraryRepository)
                .deleteByItineraryItineraryId(itineraryId);

        verify(savedItineraryRepository)
                .deleteByItineraryItineraryId(itineraryId);

        verify(thumbnailRepository)
                .deleteByItineraryItineraryId(itineraryId);

        verify(itineraryRepository).delete(itinerary);
        verify(itineraryRepository).flush();

        verify(storageService).delete("images/image1.jpg");
        verify(storageService).delete("images/image2.jpg");
        verify(storageService).delete("thumbnails/thumbnail.jpg");
    }

    @Test
    void shouldDeleteItineraryWithoutThumbnailFile() {
        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(imageRepository.findByItineraryId(itineraryId))
                .thenReturn(List.of());

        when(thumbnailRepository.findByItineraryItineraryId(itineraryId))
                .thenReturn(Optional.empty());

        itineraryService.deleteItineraryById(itineraryId);

        verify(itineraryRepository).delete(itinerary);
        verify(itineraryRepository).flush();

        verify(thumbnailRepository)
                .deleteByItineraryItineraryId(itineraryId);

        verifyNoInteractions(storageService);
    }

    @Test
    void shouldIgnoreImagesWithNullFilePathsDuringDeletion() {
        Image imageWithPath = mock(Image.class);
        Image imageWithoutPath = mock(Image.class);

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(imageRepository.findByItineraryId(itineraryId))
                .thenReturn(List.of(imageWithPath, imageWithoutPath));

        when(imageWithPath.getFilePath())
                .thenReturn("images/photo.jpg");

        when(imageWithoutPath.getFilePath())
                .thenReturn(null);

        when(thumbnailRepository.findByItineraryItineraryId(itineraryId))
                .thenReturn(Optional.empty());

        itineraryService.deleteItineraryById(itineraryId);

        verify(storageService).delete("images/photo.jpg");
        verify(storageService, times(1)).delete(anyString());
    }

    @Test
    void shouldRejectDeleteWhenItineraryDoesNotExist() {
        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                itineraryService.deleteItineraryById(itineraryId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary not found.");

        verify(itineraryRepository).findById(itineraryId);
        verifyNoInteractions(authorizationService);
        verifyNoInteractions(imageRepository);
        verifyNoInteractions(thumbnailRepository);
        verifyNoInteractions(storageService);
    }

    @Test
    void shouldPropagateStorageExceptionWhenImageDeletionFails() {
        Image image = mock(Image.class);

        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        when(imageRepository.findByItineraryId(itineraryId))
                .thenReturn(List.of(image));

        when(image.getFilePath())
                .thenReturn("images/failing.jpg");

        when(thumbnailRepository.findByItineraryItineraryId(itineraryId))
                .thenReturn(Optional.empty());

        doThrow(new RuntimeException("Storage failure"))
                .when(storageService)
                .delete("images/failing.jpg");

        assertThatThrownBy(() ->
                itineraryService.deleteItineraryById(itineraryId)
        )
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Storage failure");

        verify(storageService).delete("images/failing.jpg");
    }

    // ---------------------------------------------------------
    // Search / Explore
    // ---------------------------------------------------------

    @Test
    void shouldGetItinerariesUsingRecentSort() {
        Page<Itinerary> page = new PageImpl<>(List.of(itinerary));

        when(itineraryRepository.searchItineraries(
                any(String.class),
                eq("all"),
                any(Pageable.class)
        )).thenReturn(page);

        Page<ItineraryListResponseDto> result =
                itineraryService.getItineraries(
                        "Shimla",
                        "all",
                        "recent",
                        0,
                        10
                );

        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).searchItineraries(
                eq("shimla"),
                eq("all"),
                captor.capture()
        );

        Pageable pageable = captor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort().getOrderFor("createdAt").getDirection())
                .isEqualTo(Sort.Direction.DESC);
        assertThat(pageable.getSort().getOrderFor("itineraryId").getDirection())
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void shouldGetItinerariesUsingLikesSort() {
        Page<Itinerary> page =
                new PageImpl<>(List.of(itinerary));

        when(itineraryRepository.searchItineraries(
                any(String.class),
                anyString(),
                any(Pageable.class)
        )).thenReturn(page);

        itineraryService.getItineraries(
                "Shimla",
                "Adventure",
                "likes",
                1,
                8
        );

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).searchItineraries(
                eq("shimla"),
                eq("Adventure"),
                captor.capture()
        );

        Pageable pageable = captor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(1);
        assertThat(pageable.getPageSize()).isEqualTo(8);
        assertThat(pageable.getSort().getOrderFor("likeCount").getDirection())
                .isEqualTo(Sort.Direction.DESC);
        assertThat(pageable.getSort().getOrderFor("createdAt").getDirection())
                .isEqualTo(Sort.Direction.DESC);
        assertThat(pageable.getSort().getOrderFor("itineraryId").getDirection())
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void shouldGetItinerariesUsingSavesSort() {
        Page<Itinerary> page =
                new PageImpl<>(List.of(itinerary));

        when(itineraryRepository.searchItineraries(
                any(String.class),
                anyString(),
                any(Pageable.class)
        )).thenReturn(page);

        itineraryService.getItineraries(
                "Shimla",
                "all",
                "saves",
                2,
                5
        );

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).searchItineraries(
                eq("shimla"),
                eq("all"),
                captor.capture()
        );

        Pageable pageable = captor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(5);
        assertThat(pageable.getSort().getOrderFor("saveCount").getDirection())
                .isEqualTo(Sort.Direction.DESC);
    }

    // ---------------------------------------------------------
    // Retrieval
    // ---------------------------------------------------------

    @Test
    void shouldGetItineraryById() {
        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.of(itinerary));

        ItineraryResponseDto result =
                itineraryService.getItineraryById(itineraryId);

        assertThat(result.getItineraryId()).isEqualTo(itineraryId);
        assertThat(result.getTitle()).isEqualTo("Shimla Adventure");

        verify(itineraryRepository).findById(itineraryId);
    }

    @Test
    void shouldRejectGetItineraryByIdWhenNotFound() {
        when(itineraryRepository.findById(itineraryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                itineraryService.getItineraryById(itineraryId)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Itinerary not found.");
    }

    @Test
    void shouldGetAllItinerariesByType() {
        Itinerary second = new Itinerary();
        second.setItineraryId(UUID.randomUUID());
        second.setPlace("Manali");
        second.setTitle("Manali Trip");
        second.setStartDate(LocalDate.of(2026, 2, 1));
        second.setEndDate(LocalDate.of(2026, 2, 3));
        second.setTotalDays(3L);
        second.setPublic(true);
        second.setLikeCount(2);
        second.setSaveCount(1);
        second.setCreatedBy(user);
        second.setType(itineraryType);

        when(itineraryRepository.findAllByTypeTypeId(1L))
                .thenReturn(List.of(itinerary, second));

        List<ItineraryListResponseDto> result =
                itineraryService.getAllItinerariesByType(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle())
                .isEqualTo("Shimla Adventure");
        assertThat(result.get(1).getTitle())
                .isEqualTo("Manali Trip");

        verify(itineraryRepository).findAllByTypeTypeId(1L);
    }

    // ---------------------------------------------------------
    // User itinerary pagination
    // ---------------------------------------------------------

    @Test
    void shouldGetAllItinerariesByUserId() {
        when(itineraryRepository.findAllByCreatedByUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(itinerary)));

        Page<ItineraryListResponseDto> result =
                itineraryService.getAllItinerariesByUserId(
                        userId,
                        1,
                        10
                );

        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).findAllByCreatedByUserId(
                eq(userId),
                captor.capture()
        );

        assertThat(captor.getValue().getPageNumber()).isEqualTo(1);
        assertThat(captor.getValue().getPageSize()).isEqualTo(10);
        assertThat(
                captor.getValue()
                        .getSort()
                        .getOrderFor("createdAt")
                        .getDirection()
        ).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void shouldNormalizeNegativePageForUserItineraries() {
        when(itineraryRepository.findAllByCreatedByUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        itineraryService.getAllItinerariesByUserId(
                userId,
                -5,
                10
        );

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).findAllByCreatedByUserId(
                eq(userId),
                captor.capture()
        );

        assertThat(captor.getValue().getPageNumber())
                .isEqualTo(0);
    }

    @Test
    void shouldClampUserItineraryPageSizeToMaximum15() {
        when(itineraryRepository.findAllByCreatedByUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        itineraryService.getAllItinerariesByUserId(
                userId,
                0,
                100
        );

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).findAllByCreatedByUserId(
                eq(userId),
                captor.capture()
        );

        assertThat(captor.getValue().getPageSize())
                .isEqualTo(15);
    }

    @Test
    void shouldClampUserItineraryPageSizeToMinimum1() {
        when(itineraryRepository.findAllByCreatedByUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        itineraryService.getAllItinerariesByUserId(
                userId,
                0,
                0
        );

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(itineraryRepository).findAllByCreatedByUserId(
                eq(userId),
                captor.capture()
        );

        assertThat(captor.getValue().getPageSize())
                .isEqualTo(1);
    }

    // ---------------------------------------------------------
    // Membership / Saved
    // ---------------------------------------------------------

    @Test
    void shouldGetAllItinerariesByUserMembership() {
        when(itineraryRepository.findAllByMemberUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(itinerary)));

        Page<ItineraryListResponseDto> result =
                itineraryService.getAllItinerariesByUserMembership(
                        userId,
                        0,
                        10
                );

        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        verify(itineraryRepository).findAllByMemberUserId(
                eq(userId),
                any(Pageable.class)
        );
    }

    @Test
    void shouldGetAllSavedItinerariesByUserId() {
        when(itineraryRepository.findAllBySavedUserId(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(itinerary)));

        Page<ItineraryListResponseDto> result =
                itineraryService.getAllSavedItinerariesByUserId(
                        userId,
                        0,
                        10
                );

        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        verify(itineraryRepository).findAllBySavedUserId(
                eq(userId),
                any(Pageable.class)
        );
    }

    // ---------------------------------------------------------
    // Most liked / saved
    // ---------------------------------------------------------

    @Test
    void shouldGetMostSavedItineraries() {
        when(itineraryRepository.findMostSavedItineraries())
                .thenReturn(List.of(itinerary));

        List<ItineraryListResponseDto> result =
                itineraryService.getMostSavedItineraries();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        verify(itineraryRepository).findMostSavedItineraries();
    }

    @Test
    void shouldGetMostLikedItineraries() {
        when(itineraryRepository.findMostLikedItineraries())
                .thenReturn(List.of(itinerary));

        List<ItineraryListResponseDto> result =
                itineraryService.getMostLikedItineraries();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle())
                .isEqualTo("Shimla Adventure");

        verify(itineraryRepository).findMostLikedItineraries();
    }
}