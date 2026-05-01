package com.scholarhub.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class StorageService {
  private final Path uploadPath;

  public StorageService(@Value("${app.upload-dir}") String uploadDir) {
    this.uploadPath = Path.of(uploadDir);
  }

  @PostConstruct
  void init() {
    try {
      Files.createDirectories(uploadPath);
    } catch (IOException exception) {
      throw new IllegalStateException("Could not initialize upload storage.", exception);
    }
  }

  public String store(@NonNull MultipartFile file) {
    String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename(), "Original filename is required"));
    String storedFileName = UUID.randomUUID() + "-" + originalFilename.replace(" ", "-");

    try {
      Files.copy(file.getInputStream(), uploadPath.resolve(storedFileName),
          StandardCopyOption.REPLACE_EXISTING);
      return storedFileName;
    } catch (IOException exception) {
      throw new ApiException("Unable to save the uploaded document.");
    }
  }

  public Resource loadAsResource(@NonNull String storedFileName) {
    Path filePath = uploadPath.resolve(storedFileName).normalize();
    Resource resource = new FileSystemResource(filePath);

    if (!filePath.startsWith(uploadPath.normalize()) || !resource.exists()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Uploaded document was not found.");
    }

    return resource;
  }

  public void delete(String storedFileName) {
    try {
      Files.deleteIfExists(uploadPath.resolve(storedFileName).normalize());
    } catch (IOException exception) {
      throw new ApiException("Unable to delete the uploaded document.");
    }
  }
}
