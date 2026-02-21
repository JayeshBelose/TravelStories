package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.dto.ImageResponseDto;
import org.travel_stories.entity.Image;
import org.travel_stories.entity.Location;
import org.travel_stories.repository.ImageRepository;
import org.travel_stories.repository.LocationRepository;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public void uploadImage(UUID locationId, MultipartFile file) throws IOException {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found."));

        int nextOrderNumber = imageRepository.findNextOrderNumber(locationId) + 1;

        Image image = new Image();
        image.setOrderNumber(nextOrderNumber);
        image.setImageData(file.getBytes());
        image.setContentType(file.getContentType());
        image.setLocation(location);

        imageRepository.save(image);
    }

    public void deleteImage(UUID imageId) {
        Image image = imageRepository.findById(imageId)
                        .orElseThrow(() -> new RuntimeException("Image not found."));

        int deleteImageNumber = image.getOrderNumber();

        imageRepository.deleteById(imageId);
        imageRepository.flush();

        List<Image> imageToAdjust = imageRepository.findByLocationLocationIdOrderByOrderNumber(image.getLocation().getLocationId());

        for (Image i : imageToAdjust){
            if (i.getOrderNumber() > deleteImageNumber){
                i.setOrderNumber(i.getOrderNumber()-1);
            }
        }
        imageRepository.saveAll(imageToAdjust);
    }

    public List<ImageResponseDto> getImagesByLocation(UUID locationId) {
        return imageRepository.findByLocationLocationIdOrderByOrderNumber(locationId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<ImageResponseDto> getAllImages(){
        return imageRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

}
