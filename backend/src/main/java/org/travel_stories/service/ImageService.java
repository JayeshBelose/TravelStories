package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.entity.Image;
import org.travel_stories.entity.Location;
import org.travel_stories.exception.ResourceNotFoundException;
import org.travel_stories.repository.ImageRepository;
import org.travel_stories.repository.LocationRepository;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ImageService {

    private final ImageRepository imageRepository;
    private final LocationRepository locationRepository;

    public ImageResponseDto map(Image image){
        return new ImageResponseDto(
                image.getImageId(),
                image.getImageData()
        );
    }

    @Transactional
    public void uploadImage(UUID locationId, MultipartFile file) throws IOException {

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Location not found."));

        int nextOrderNumber = imageRepository.findNextOrderNumber(locationId) + 1;

        Image image = new Image();
        image.setOrderNumber(nextOrderNumber);
        image.setImageData(file.getBytes());
        image.setContentType(file.getContentType());
        image.setLocation(location);

        imageRepository.save(image);
    }

    @Transactional
    public void deleteImage(UUID imageId) {

        Image image = imageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found."));

        int deletedImageNumber = image.getOrderNumber();
        UUID locationId = image.getLocation().getLocationId();

        imageRepository.delete(image);
        imageRepository.flush();

        List<Image> imagesToAdjust =
                imageRepository.findByLocationLocationIdOrderByOrderNumber(locationId);

        for (Image img : imagesToAdjust) {
            if (img.getOrderNumber() > deletedImageNumber) {
                img.setOrderNumber(img.getOrderNumber() - 1);
            }
        }

        imageRepository.saveAll(imagesToAdjust);
    }

    public List<ImageResponseDto> getImagesByLocation(UUID locationId) {

        return imageRepository.findByLocationLocationIdOrderByOrderNumber(locationId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ImageResponseDto> getAllImages() {

        return imageRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    public Image getImageById(UUID imageId) {

        return imageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found."));
    }

}
