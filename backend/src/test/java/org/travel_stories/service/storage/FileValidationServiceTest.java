package org.travel_stories.service.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.travel_stories.exception.operation.InvalidOperationException;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class FileValidationServiceTest {

    private FileValidationService service;

    @BeforeEach
    void setUp() {
        service = new FileValidationService();
    }

    @Test
    @DisplayName("Should accept valid JPEG image")
    void shouldAcceptValidJpeg() {

        byte[] jpegBytes = new byte[]{
                (byte) 0xFF, (byte) 0xD8,
                (byte) 0xFF, (byte) 0xE0,
                0x00, 0x10,
                0x4A, 0x46, 0x49, 0x46,
                0x00
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.jpg",
                "image/jpeg",
                jpegBytes
        );

        String result = service.validateMimeType(file);

        assertThat(result).isEqualTo("image/jpeg");
    }

    @Test
    @DisplayName("Should accept valid PNG image")
    void shouldAcceptValidPng() {

        byte[] pngBytes = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                pngBytes
        );

        String result = service.validateMimeType(file);

        assertThat(result).isEqualTo("image/png");
    }

    @Test
    @DisplayName("Should reject null file")
    void shouldRejectNullFile() {

        assertThatThrownBy(() -> service.validateMimeType(null))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Uploaded file cannot be empty.");
    }

    @Test
    @DisplayName("Should reject empty file")
    void shouldRejectEmptyFile() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Uploaded file cannot be empty.");
    }

    @Test
    @DisplayName("Should reject file with missing filename")
    void shouldRejectMissingFilename() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                null,
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Uploaded file must have a valid filename.");
    }

    @Test
    @DisplayName("Should reject filename containing path traversal")
    void shouldRejectPathTraversalFilename() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../malicious.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Invalid file name.");
    }

    @Test
    @DisplayName("Should reject filename without extension")
    void shouldRejectMissingExtension() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Uploaded file must have a valid extension.");
    }

    @Test
    @DisplayName("Should reject unsupported file extension")
    void shouldRejectUnsupportedExtension() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.exe",
                "application/octet-stream",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "Unsupported file extension. Only JPG, JPEG, PNG and WEBP files are allowed."
                );
    }

    @Test
    @DisplayName("Should reject unsupported actual MIME type")
    void shouldRejectUnsupportedMimeType() {

        byte[] textBytes = "This is not an image".getBytes();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.jpg",
                "image/jpeg",
                textBytes
        );

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "Unsupported file type. Only JPEG, PNG and WebP images are allowed."
                );
    }

    @Test
    @DisplayName("Should reject IOException while reading file")
    void shouldRejectIOException() throws IOException {

        MultipartFile file = mock(MultipartFile.class);

        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("image.jpg");
        when(file.getInputStream())
                .thenThrow(new IOException("Simulated read failure"));

        assertThatThrownBy(() -> service.validateMimeType(file))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Unable to validate uploaded file.");
    }

    @Test
    @DisplayName("Should accept uppercase file extension")
    void shouldAcceptUppercaseExtension() {

        byte[] jpegBytes = new byte[]{
                (byte) 0xFF, (byte) 0xD8,
                (byte) 0xFF, (byte) 0xE0,
                0x00, 0x10,
                0x4A, 0x46, 0x49, 0x46,
                0x00
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "IMAGE.JPG",
                "image/jpeg",
                jpegBytes
        );

        String result = service.validateMimeType(file);

        assertThat(result).isEqualTo("image/jpeg");
    }
}